import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { UserPlus, X, ShieldAlert, CheckCircle } from 'lucide-react';

interface RegistrationModalProps {
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onClose }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('1CSE22');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await register({
        fullName,
        email,
        role,
        studentId: studentId || (role === 'student' ? `26CS${Math.floor(1000 + Math.random() * 9000)}` : `FAC-${Math.floor(100 + Math.random() * 900)}`),
        department,
        semester,
        section,
        password: password || 'Password123!',
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E5DCCB] shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Top Bar in 30% Ink Black */}
        <div className="p-6 bg-[#171717] text-[#F5F0E6] rounded-t-3xl border-b border-[#2B2B2B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#C65D32] text-[#F5F0E6] shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C65D32] font-bold">
                INSTITUTIONAL ENROLLMENT
              </span>
              <h3 className="text-lg font-black text-[#F5F0E6]">Register Student Account</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body in 60% Cream */}
        <div className="p-6 sm:p-8 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Malhotra"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">University Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. vikram.malhotra@snpsu.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Requested Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Member</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">
                  {role === 'student' ? 'Student Roll ID' : 'Faculty ID'}
                </label>
                <input
                  type="text"
                  placeholder={role === 'student' ? 'e.g. 26CS1092' : 'e.g. FAC-405'}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Section</label>
                <input
                  type="text"
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Account Password</label>
              <input
                type="password"
                placeholder="Choose account password (default: Password123!)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            {/* Institutional Approval Notice */}
            <div className="p-3.5 rounded-2xl bg-[#171717] text-[#F5F0E6] text-[11px] leading-relaxed border border-[#2B2B2B]">
              <span className="text-[#C65D32] font-black block mb-0.5">&bull; Approval Workflow Notice:</span>
              <p className="text-[#B3ADA3]">
                New accounts receive a <code className="text-[#F5F0E6] font-bold">pending</code> status. Workspace resources unlock immediately once confirmed by the Class Administrator.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DCCB]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl btn-cream-outline text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold shadow-md cursor-pointer"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
