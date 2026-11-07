import React from 'react';

interface UserAvatarProps {
  name?: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  role = 'student',
  size = 'md',
  className = '',
}) => {
  // Generate 2-letter initials from name
  const getInitials = (n: string) => {
    const clean = n.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Gradient based on institutional role
  const getGradient = (r?: string) => {
    switch (r) {
      case 'super_admin':
        return 'bg-gradient-to-br from-[#EC4899] to-[#BE185D] text-white border-pink-400/40 shadow-[0_0_12px_rgba(236,72,153,0.35)]';
      case 'class_admin':
        return 'bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] text-white border-purple-400/40 shadow-[0_0_12px_rgba(139,92,246,0.35)]';
      case 'faculty':
        return 'bg-gradient-to-br from-[#06B6D4] to-[#0284C7] text-white border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.35)]';
      case 'student':
      default:
        return 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.35)]';
    }
  };

  // Dimensions
  const getSizeClasses = (s: string) => {
    switch (s) {
      case 'xs':
        return 'w-6 h-6 text-[10px] rounded-lg';
      case 'sm':
        return 'w-7 h-7 text-xs rounded-xl';
      case 'md':
        return 'w-8 h-8 text-xs rounded-xl';
      case 'lg':
        return 'w-10 h-10 text-sm rounded-2xl';
      case 'xl':
        return 'w-12 h-12 text-base rounded-2xl';
      default:
        return 'w-8 h-8 text-xs rounded-xl';
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-bold tracking-wider font-mono select-none border shrink-0 ${getSizeClasses(
        size
      )} ${getGradient(role)} ${className}`}
      title={`${name} (${role})`}
    >
      {initials}
    </div>
  );
};
