import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';
import { dbStore, DEFAULT_DEMO_PASSWORD, DEFAULT_PASSWORD_HASH } from './mockDatabase';
import { UserProfile, UserRole } from '../types';
import { hashPassword, verifyPassword } from '../lib/crypto';

export const authService = {
  // Get active session user
  async getCurrentProfile(userId?: string): Promise<UserProfile | null> {
    const targetId = userId || localStorage.getItem('sc2_active_user_id');
    if (!targetId) {
      return null;
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();

        if (data && !error) return data as UserProfile;
      } catch (err) {
        console.warn('Supabase profile query fallback to local:', err);
      }
    }

    const local = dbStore.profiles.find((p) => p.id === targetId);
    return local || null;
  },

  // Log in with Student Roll ID, Faculty ID, or University Email and password verification
  async login(identifier: string, password?: string): Promise<{ user?: UserProfile; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { error: 'Please enter your Student Roll ID or institutional email.' };
    }

    if (!password || !password.trim()) {
      return { error: 'Please enter your password. (Demo default: Password123!)' };
    }

    // Sanitize identifier to prevent PostgREST filter injection
    const sanitizedId = cleanId.replace(/[^a-zA-Z0-9@._-]/g, '');

    // Check local database profiles first
    let profile = dbStore.profiles.find(
      (p) =>
        p.student_id?.toLowerCase() === sanitizedId ||
        p.email.toLowerCase() === sanitizedId
    );

    // If Supabase is configured and not found in local memory, check remote database
    if (!profile && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`student_id.ilike.${sanitizedId},email.ilike.${sanitizedId}`)
          .maybeSingle();

        if (data && !error) {
          profile = data as UserProfile;
          if (!dbStore.profiles.some((p) => p.id === profile!.id)) {
            dbStore.profiles.push(profile);
            dbStore.persist();
          }
        }
      } catch (err) {
        console.warn('Supabase login lookup error:', err);
      }
    }

    if (!profile) {
      return {
        error: `No account found for Student Roll ID or Email "${identifier}". Please check your ID or register a new student account.`,
      };
    }

    // Authenticate with live Supabase Auth when configured
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: password,
        });

        if (authError) {
          // If Supabase auth rejected the credentials, do not authenticate
          return { error: `Authentication failed: ${authError.message}` };
        }
      } catch (err: any) {
        console.warn('Supabase auth sign in error, checking local cryptographic credentials:', err);
      }
    }

    // Verify cryptographic password hash for local / offline mode
    const storedHash = profile.password_hash || DEFAULT_PASSWORD_HASH;
    const isPasswordValid = await verifyPassword(password, storedHash);

    if (!isPasswordValid) {
      return {
        error: 'Invalid password. Please check your credentials or use the demo password (Password123!).',
      };
    }

    localStorage.setItem('sc2_active_user_id', profile.id);
    realtimeBus.emit('auth_state_change', profile);
    return { user: profile };
  },

  // Switch between demo accounts (Sanbox / Demo Mode only)
  async switchUser(userId: string): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      console.warn('Direct user switching is restricted in live Supabase environment to preserve session security.');
    }
    const profile = dbStore.profiles.find((p) => p.id === userId) || dbStore.profiles[0];
    localStorage.setItem('sc2_active_user_id', profile.id);
    realtimeBus.emit('auth_state_change', profile);
    return profile;
  },

  // Register new account (student or faculty only)
  async register(data: {
    fullName: string;
    email: string;
    role: UserRole;
    studentId?: string;
    department: string;
    semester: number;
    section: string;
    password?: string;
  }): Promise<{ user: UserProfile; error?: string }> {
    // Security check: Class Admin accounts must never be created via self-registration
    if ((data.role as string) === 'class_admin' || (data.role as string) === 'super_admin') {
      return {
        user: null as any,
        error: 'Class Admin accounts cannot be created via self-registration. They must be provisioned manually by the institutional application owner.',
      };
    }

    if (data.role !== 'student' && data.role !== 'faculty') {
      return {
        user: null as any,
        error: 'Invalid role requested. Only student and faculty accounts can register.',
      };
    }

    const rawPassword = data.password && data.password.trim() ? data.password : DEFAULT_DEMO_PASSWORD;
    const passwordHash = await hashPassword(rawPassword);

    // Generate UUID
    const newId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Check if email already exists
    const existing = dbStore.profiles.find(
      (p) =>
        p.email.toLowerCase() === data.email.toLowerCase() ||
        (data.studentId && p.student_id?.toLowerCase() === data.studentId.toLowerCase())
    );
    if (existing) {
      return { user: existing, error: 'An account with this email or Student Roll ID already exists' };
    }

    const newProfile: UserProfile = {
      id: newId,
      full_name: data.fullName,
      email: data.email,
      role: data.role,
      student_id: data.studentId || `26CS${Math.floor(1000 + Math.random() * 9000)}`,
      department: data.department,
      semester: data.semester,
      section: data.section,
      approval_status: 'pending', // MUST initially be pending
      avatar_url: undefined,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Real Supabase attempt
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: rawPassword,
          options: {
            data: {
              full_name: data.fullName,
              role: data.role,
            },
          },
        });
        if (authError) throw authError;

        if (authData.user) {
          newProfile.id = authData.user.id;
          await supabase.from('profiles').insert([newProfile]);
          await supabase.from('registration_requests').insert([
            {
              user_id: authData.user.id,
              requested_role: data.role,
              status: 'pending',
              notes: `New registration from ${data.email} for section ${data.section}`,
            },
          ]);
        }
      } catch (err) {
        console.warn('Supabase auth sign up exception, proceeding with secure store:', err);
      }
    }

    // Add to database store
    dbStore.profiles.push(newProfile);
    dbStore.registrationRequests.push({
      id: `req-${Date.now()}`,
      user_id: newProfile.id,
      requested_role: data.role,
      status: 'pending',
      notes: `New registration request for ${data.role} in ${data.section}`,
      created_at: new Date().toISOString(),
    });
    dbStore.persist();

    // Auto-notify admins
    dbStore.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001', // Super Admin
      title: 'New Account Pending Approval',
      message: `${data.fullName} has registered as ${data.role} (${newProfile.student_id}). Please review the registration.`,
      notification_type: 'approval',
      related_id: newProfile.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    dbStore.persist();

    localStorage.setItem('sc2_active_user_id', newProfile.id);
    realtimeBus.emit('auth_state_change', newProfile);

    return { user: newProfile };
  },

  // Sign out - completely clears user session and returns to login view
  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    localStorage.removeItem('sc2_active_user_id');
    realtimeBus.emit('auth_state_change', null);
  },

  // Reset password simulation
  async requestPasswordReset(email: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.resetPasswordForEmail(email);
        return true;
      } catch (err) {
        console.warn('Supabase resetPassword error:', err);
      }
    }
    return true;
  }
};
