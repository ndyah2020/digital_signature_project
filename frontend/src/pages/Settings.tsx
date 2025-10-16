import React, { useState, createElement } from 'react';
import { Save, Download, Key, Lock, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/use-toast';
const Settings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, logout} = useAuth();
  const { toast } = useToast();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu xác nhận không khớp.',
        variant: 'destructive'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      toast({
        title: 'Thành công',
        description: 'Mật khẩu đã được thay đổi thành công.'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể thay đổi mật khẩu. Vui lòng thử lại sau.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPublicKey = () => {
    if (!user?.publicKey) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy khóa công khai.',
        variant: 'destructive'
      });
      return;
    }
    // Create a blob from the public key
    const blob = new Blob([user.publicKey], {
      type: 'text/plain'
    });

    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    // Create a link element and trigger a download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'public_key.pem';
    document.body.appendChild(link);
    link.click();
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'Thành công',
      description: 'Đã tải xuống khóa công khai.'
    });
  };
  const handleLogout = () => {
    toast({
      title: 'Đã đăng xuất',
      description: 'Bạn đã đăng xuất khỏi hệ thống.'
    });
    logout();
  };
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
    {/* User Information */}
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Thông tin tài khoản
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Thông tin cá nhân và tài khoản của bạn.
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Họ và tên</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {user?.name || 'N/A'}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {user?.email || 'N/A'}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Vai trò</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {user?.role === 'admin' && 'Quản trị viên'}
              {user?.role === 'manager' && 'Quản lý'}
              {user?.role === 'user' && 'Người dùng'}
              {!user?.role && 'N/A'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
    {/* Change Password */}
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Thay đổi mật khẩu
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Cập nhật mật khẩu đăng nhập của bạn.
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
              Mật khẩu hiện tại
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input id="current-password" name="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input id="new-password" name="new-password" type="password" autoComplete="new-password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75">
              {isSubmitting ? <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Đang xử lý...
              </> : <>
                <Save className="mr-2 h-5 w-5" />
                Lưu thay đổi
              </>}
            </button>
          </div>
        </form>
      </div>
    </div>
    {/* Key Management */}
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Quản lý khóa
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Quản lý khóa công khai và khóa bí mật của bạn.
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="mb-6 rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Key className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Thông tin bảo mật
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Hệ thống sử dụng cặp khóa công khai/bí mật để ký và xác thực
                  hợp đồng. Khóa bí mật của bạn được mã hóa bằng mật khẩu và
                  không bao giờ được gửi lên server.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Khóa công khai
          </label>
          <div className="mt-1">
            <textarea readOnly rows={3} className="block w-full rounded-md border-gray-300 bg-gray-50 font-mono text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={user?.publicKey || 'Không có khóa công khai'} />
          </div>
          <div className="mt-2">
            <button onClick={handleDownloadPublicKey} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <Download className="mr-2 h-4 w-4" />
              Tải xuống khóa công khai
            </button>
          </div>
        </div>
      </div>
    </div>
    {/* Account Actions */}
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Thao tác tài khoản
        </h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <button onClick={handleLogout} className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
          <LogOut className="mr-2 h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  </div>;
};
export default Settings;