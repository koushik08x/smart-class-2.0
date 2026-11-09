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

  // Styling based on institutional role within the 3-colour system
  const getRoleStyle = (r?: string) => {
    switch (r) {
      case 'class_admin':
        return 'bg-gradient-to-br from-[#C65D32] to-[#A2461F] text-[#F5F0E6] border-[#C65D32]/60 shadow-[0_2px_12px_rgba(198,93,50,0.35)]';
      case 'faculty':
        return 'bg-[#171717] text-[#F5F0E6] border-[#C65D32]/50 shadow-sm';
      case 'student':
      default:
        return 'bg-[#EDE5D8] text-[#171717] border-[#D5C8B2] font-bold';
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
      )} ${getRoleStyle(role)} ${className}`}
      title={`${name} (${role})`}
    >
      {initials}
    </div>
  );
};
