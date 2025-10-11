/**
 * Format date to locale string
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};
/**
 * Format file size to human readable string
 * @param bytes File size in bytes
 * @returns Formatted file size
 */
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
/**
 * Truncate string to specified length
 * @param str String to truncate
 * @param length Maximum length
 * @returns Truncated string
 */
export const truncateString = (str: string, length: number) => {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};
/**
 * Get initials from name
 * @param name Full name
 * @returns Initials (1-2 characters)
 */
export const getInitials = (name: string) => {
  if (!name) return '';
  const names = name.split(' ').filter(n => n.length > 0);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};
/**
 * Format contract status to display text and color
 * @param status Contract status
 * @returns Object with text and color
 */
export const formatContractStatus = (status: string) => {
  const statusMap: Record<string, {
    text: string;
    color: string;
  }> = {
    draft: {
      text: 'Bản nháp',
      color: 'bg-gray-200 text-gray-800'
    },
    pending: {
      text: 'Chờ ký',
      color: 'bg-yellow-100 text-yellow-800'
    },
    signed: {
      text: 'Đã ký',
      color: 'bg-green-100 text-green-800'
    },
    cancelled: {
      text: 'Đã hủy',
      color: 'bg-red-100 text-red-800'
    }
  };
  return statusMap[status] || {
    text: status,
    color: 'bg-gray-200 text-gray-800'
  };
};
/**
 * Check if user has permission based on role
 * @param role User role
 * @param permission Required permission
 * @returns Boolean indicating if user has permission
 */
export const hasPermission = (role: string, permission: string) => {
  const rolePermissions: Record<string, string[]> = {
    admin: ['manage_users', 'create_contract', 'sign_contract', 'view_contract'],
    manager: ['create_contract', 'sign_contract', 'view_contract'],
    user: ['view_contract', 'sign_contract']
  };
  return rolePermissions[role]?.includes(permission) || false;
};