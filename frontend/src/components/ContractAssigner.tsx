import React, { useState, useEffect } from 'react';
import { X, User, Loader2, Search } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { ContractDataType } from '../type/contract.type';
import {UserData} from '../type/auth'

import {  useAddRecipient} from '../api/contract.api'; 

import {findUserByEmail} from '../api/user.api'

interface ContractAssignerProps {
  isOpen: boolean;
  contract: ContractDataType | null;
  onClose: () => void;
  onAssignSuccess: () => void;
}

const ContractAssigner: React.FC<ContractAssignerProps> = ({
  isOpen,
  contract,
  onClose,
  onAssignSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [foundUser, setFoundUser] = useState<UserData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { mutate: addRecipientMutate, isLoading: isAssigning } = useAddRecipient();

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setFoundUser(null);
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSearching(true);
    setFoundUser(null);
    try {
      const user = await findUserByEmail(email);
      setFoundUser(user);
      toast({
        title: 'Tìm thấy người dùng',
        description: `Đã tìm thấy: ${user.name} (${user.email})`,
      });
    } catch (err: any) {
      toast({
        title: 'Lỗi tìm kiếm',
        description: err.message || 'Không tìm thấy người dùng hoặc có lỗi xảy ra.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssign = async () => {
    if (!foundUser || !contract) return;
    try {
      await addRecipientMutate({
        contractId: contract.id,
        recipientIds: foundUser.id,
      });
      toast({
        title: 'Gán thành công!',
        description: `Đã gán ${foundUser.name} vào hợp đồng.`,
        variant: 'default',
      });
      onAssignSuccess(); 
      onClose();
    } catch (err: any) {
      toast({
        title: 'Lỗi khi gán',
        description: err.response?.data?.message || err.message || 'Không thể gán người dùng.',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="mb-2 text-xl font-bold text-gray-800">
          Gán người dùng
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Hợp đồng: <span className="font-medium text-gray-700">{contract.title}</span>
        </p>

        {/* 1. Form tìm kiếm */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email người dùng
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhap.email@vidu.com"
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching || !email}
                className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium ${
                  isSearching
                    ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isSearching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 2. Kết quả tìm kiếm & Nút gán */}
        {foundUser && (
          <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
            <h3 className="text-sm font-medium text-green-800">
              Kết quả tìm kiếm
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-900">{foundUser.name}</p>
                <p className="text-sm text-green-700">{foundUser.email}</p>
              </div>
              <button
                type="button"
                onClick={handleAssign}
                disabled={isAssigning}
                className={`inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white ${
                  isAssigning
                    ? 'cursor-not-allowed opacity-70'
                    : 'hover:bg-indigo-700'
                }`}
              >
                {isAssigning ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <User size={16} className="mr-2" />
                )}
                {isAssigning ? 'Đang gán...' : 'Gán người này'}
              </button>
            </div>
          </div>
        )}

        {/* 3. Nút Hủy (nếu không có kết quả) */}
        {!foundUser && (
           <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
             <button
                type="button"
                onClick={onClose}
                className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
           </div>
        )}

      </div>
    </div>
  );
};

export default ContractAssigner;

