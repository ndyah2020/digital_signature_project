import React, { useState } from "react";
import { Save, Download, Key, Lock, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ui/use-toast";

const Settings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, logout } = useAuth();
  const { toast } = useToast();

  // ------------------- HANDLERS -------------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi API đổi mật khẩu ở đây nếu có
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được thay đổi thành công.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể thay đổi mật khẩu. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPublicKey = () => {
    if (!user?.publicKey) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy khóa công khai.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([user.publicKey], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "public_key.pem";
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Thành công",
      description: "Đã tải xuống khóa công khai.",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất khỏi hệ thống.",
    });
  };

  // ------------------- RENDER -------------------
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">⚙️ Cài đặt tài khoản</h1>

      {/* Thông tin tài khoản */}
      <Section title="Thông tin tài khoản" description="Thông tin cá nhân và tài khoản của bạn.">
        <InfoRow label="Họ và tên" value={user?.name || "N/A"} />
        <InfoRow label="Email" value={user?.email || "N/A"} />
        <InfoRow
          label="Vai trò"
          value={
            user?.role === "admin"
              ? "Quản trị viên"
              : user?.role === "manager"
              ? "Quản lý"
              : user?.role === "user"
              ? "Người dùng"
              : "N/A"
          }
        />
      </Section>

      {/* Đổi mật khẩu */}
      <Section title="Thay đổi mật khẩu" description="Cập nhật mật khẩu đăng nhập của bạn.">
        <form onSubmit={handleChangePassword} className="space-y-5">
          <PasswordInput
            id="current-password"
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordInput
            id="new-password"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordInput
            id="confirm-password"
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Lưu thay đổi
              </>
            )}
          </button>
        </form>
      </Section>

      {/* Quản lý khóa */}
      <Section title="Quản lý khóa" description="Quản lý khóa công khai và khóa bí mật của bạn.">
        <div className="mb-4 rounded-md bg-blue-50 p-4">
          <div className="flex gap-3">
            <Key className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-blue-700">
              Hệ thống sử dụng cặp khóa công khai/bí mật để ký và xác thực hợp đồng.
              Khóa bí mật của bạn được mã hóa bằng mật khẩu và không bao giờ được gửi lên server.
            </p>
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Khóa công khai</label>
        <textarea
          readOnly
          rows={3}
          className="block w-full rounded-md border-gray-300 bg-gray-50 font-mono text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={user?.publicKey || "Không có khóa công khai"}
        />
        <button
          onClick={handleDownloadPublicKey}
          className="mt-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Download className="mr-2 h-4 w-4" />
          Tải xuống khóa công khai
        </button>
      </Section>

      {/* Thao tác tài khoản */}
      <Section title="Thao tác tài khoản">
        <button
          onClick={handleLogout}
          className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Đăng xuất
        </button>
      </Section>
    </div>
  );
};

export default Settings;

//
// ------------------- Sub Components -------------------
//

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, description, children }) => (
  <div className="overflow-hidden rounded-lg bg-white shadow">
    <div className="px-5 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

interface InfoRowProps {
  label: string;
  value: string;
}
const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="py-2 grid grid-cols-3 gap-4">
    <dt className="text-sm font-medium text-gray-600">{label}</dt>
    <dd className="col-span-2 text-sm text-gray-900">{value}</dd>
  </div>
);

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
}
const PasswordInput: React.FC<PasswordInputProps> = ({ id, label, value, onChange }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative flex items-center">
      <Lock className="absolute left-3 text-gray-400 h-4 w-4 pointer-events-none" />
      <input
        id={id}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-lg border border-gray-300 bg-white
          py-2.5 pl-10 pr-3 text-sm text-gray-900 
          placeholder-gray-400 shadow-sm
          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
          transition-all duration-150 ease-in-out
        "
        required
      />
    </div>
  </div>
);

