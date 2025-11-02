import React, { useState, useEffect } from 'react';
import { X, Key, Lock, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/use-toast';
import { useSendEmailOtp } from '../api/otpEmail';

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signature: string) => void;
  contractHash: string;
}

const SignatureDialog: React.FC<SignatureDialogProps> = ({
  isOpen,
  onClose,
  // onSign,
  // contractHash
}) => {
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [countdown, setCountdown] = useState(300); // 5 phút = 300 giây
  const [isResending, setIsResending] = useState(false);

  const { decryptPrivateKey } = useAuth();
  const { mutate: sendEmailOtp } = useSendEmailOtp();

  const { toast } = useToast();


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };


  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mật khẩu để ký hợp đồng.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const privateKeyValid = await decryptPrivateKey(password);
      if (!privateKeyValid) {
        toast({
          title: "Lỗi",
          description: "Mật khẩu không chính xác.",
          variant: "destructive",
        });
        return;
      }
      // truyền một biến giả vào đề không lỗi
      await sendEmailOtp({});
      setStep("otp");
      setCountdown(300);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Lỗi gửi OTP",
        description: "Không thể gửi mã xác thực. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };


  // const handleSubmitOtp = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!otp) {
  //     toast({
  //       title: 'Thiếu mã OTP',
  //       description: 'Vui lòng nhập mã OTP được gửi qua email.',
  //       variant: 'destructive'
  //     });
  //     return;
  //   }

  //   setIsProcessing(true);
  //   try {
  //     // Xác thực OTP với server
  //     const res = await fetch('http://localhost:3001/api/verify-otp', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ userId: user?.sub, code: otp })
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message || 'OTP không hợp lệ');

  //     // Khi OTP hợp lệ, tiến hành ký
  //     const privateKey = await decryptPrivateKey(password);
  //     const signature = await signDocument(contractHash, privateKey);
  //     onSign(signature);
  //     toast({ title: 'Ký hợp đồng thành công', description: 'Hợp đồng đã được ký xác nhận.' });

  //     // Đóng dialog & reset
  //     setPassword('');
  //     setOtp('');
  //     setStep('password');
  //     onClose();

  //   } catch (error: any) {
  //     toast({
  //       title: 'Lỗi xác thực OTP',
  //       description: error.message || 'OTP không hợp lệ hoặc đã hết hạn.',
  //       variant: 'destructive'
  //     });
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await sendEmailOtp({});
      setCountdown(300);
      toast({
        title: "Đã gửi lại OTP",
        description: "Mã xác thực mới đã được gửi đến email của bạn.",
        variant: "default",
      });
    } catch (error) {
      console.error("Lỗi khi gửi lại OTP:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi lại mã OTP. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'password' ? 'Ký hợp đồng' : 'Xác thực OTP'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'password' ? (
          // BƯỚC 1: NHẬP MẬT KHẨU
          <form onSubmit={handleSubmitPassword}>
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
              <div className="flex">
                <Key className="mr-2 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Thông tin bảo mật</p>
                  <p className="mt-1">
                    Khóa riêng tư của bạn được mã hóa và lưu trữ an toàn. Nhập mật
                    khẩu để giải mã khóa và bắt đầu ký hợp đồng.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Nhập mật khẩu để ký hợp đồng"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-75"
              >
                {isProcessing ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </form>
        ) : (
          // BƯỚC 2: NHẬP OTP  onSubmit={handleSubmitOtp}
          <form>
            <p className="mb-4 text-sm text-gray-700">
              Nhập mã OTP đã được gửi tới địa chỉ email của bạn để xác nhận việc ký hợp đồng.
            </p>

            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Mã OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Nhập mã OTP gồm 6 chữ số"
                maxLength={6}
                required
              />
            </div>

            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Thời gian còn lại: {formatTime(countdown)}</span>
              </div>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || countdown > 240} // chỉ cho gửi lại sau 1 phút
                className="text-indigo-600 hover:underline disabled:text-gray-400"
              >
                {isResending ? 'Đang gửi...' : 'Gửi lại OTP'}
              </button>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setStep('password');
                  setOtp('');
                }}
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-75"
              >
                {isProcessing ? 'Đang xác nhận...' : 'Xác nhận ký'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignatureDialog;
