import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { UserProfile, UserRole } from '../types';

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

  // Log in with Student Roll ID, Faculty ID, or University Email
  async login(identifier: string, _password?: string): Promise<{ user?: UserProfile; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { error: 'Please enter your Student Roll ID or institutional email.' };
    }

    // Check local database profiles first
    let profile = dbStore.profiles.find(
      (p) =>
        p.student_id?.toLowerCase() === cleanId ||
        p.email.toLowerCase() === cleanId
    );

    // If Supabase is configured and not found in local memory, check remote database
    if (!profile && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`student_id.ilike.${cleanId},email.ilike.${cleanId}`)
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

    localStorage.setItem('sc2_active_user_id', profile.id);
    realtimeBus.emit('auth_state_change', profile);
    return { user: profile };
  },

  // Switch between demo accounts or registered user
  async switchUser(userId: string): Promise<UserProfile> {
    const profile = dbStore.profiles.find((p) => p.id === userId) || dbStore.profiles[0];
    localStorage.setItem('sc2_active_user_id', profile.id);
    realtimeBus.emit('auth_state_change', profile);
    return profile;
  },

  // Register new account (student or faculty)
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
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Real Supabase attempt
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password || 'TemporaryPassword123!',
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
