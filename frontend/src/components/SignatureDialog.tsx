import React, { useState } from 'react';
import { X, Key, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { signDocument } from '../utils/crypto';
interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signature: string) => void;
  contractHash: string;
}
const SignatureDialog: React.FC<SignatureDialogProps> = ({
  isOpen,
  onClose,
  onSign,
  contractHash
}) => {
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    user,
    decryptPrivateKey
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập mật khẩu để ký hợp đồng.',
        variant: 'destructive'
      });
      return;
    }
    setIsProcessing(true);
    try {
      // Decrypt private key using password
      const privateKey = await decryptPrivateKey(password);
      if (!privateKey) {
        toast({
          title: 'Lỗi',
          description: 'Mật khẩu không chính xác hoặc khóa không hợp lệ.',
          variant: 'destructive'
        });
        return;
      }
      // Sign document hash with private key
      const signature = await signDocument(contractHash, privateKey);
      // Call onSign callback with signature
      onSign(signature);
      // Close dialog
      onClose();
      // Reset password
      setPassword('');
    } catch (error) {
      console.error('Error signing document:', error);
      toast({
        title: 'Lỗi ký hợp đồng',
        description: 'Có lỗi xảy ra khi ký hợp đồng. Vui lòng thử lại sau.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Ký hợp đồng</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <div className="flex">
            <Key className="mr-2 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Thông tin bảo mật</p>
              <p className="mt-1">
                Khóa riêng tư của bạn được mã hóa và lưu trữ an toàn. Nhập mật
                khẩu để giải mã khóa và ký hợp đồng.
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="hash" className="block text-sm font-medium text-gray-700">
              Hash của hợp đồng
            </label>
            <div className="mt-1">
              <input type="text" id="hash" value={contractHash} readOnly className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500" />
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
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" placeholder="Nhập mật khẩu để ký hợp đồng" required />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Hủy
            </button>
            <button type="submit" disabled={isProcessing} className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75">
              {isProcessing ? <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang xử lý...
                </> : 'Ký hợp đồng'}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export default SignatureDialog;