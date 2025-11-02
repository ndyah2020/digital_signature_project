import React, { useState, useEffect } from 'react';
import { X, User, Loader2, Search, Trash2 } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { ContractDataType } from '../type/contract.type';
import { UserData } from '../type/auth';

import { useAddRecipient } from '../api/contract.api';
import { findUserByEmail } from '../api/user.api';

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
  const [foundUsers, setFoundUsers] = useState<
    Array<UserData & { deadlineDays?: number; onExpireAction?: "cancel" | "remove" | "extend" }>
  >([]);

  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { mutate: addRecipientMutate, isLoading: isAssigning } = useAddRecipient();

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setFoundUser(null);
      setFoundUsers([]);
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSearching(true);
    setFoundUser(null);
    try {
      const user = await findUserByEmail(email);
      if (foundUsers.some((u) => u.id === user.id)) {
        toast({
          title: 'Người dùng đã có trong danh sách',
          description: `${user.name} (${user.email})`,
          variant: 'destructive',
        });
      } else {
        setFoundUser(user);
        toast({
          title: 'Tìm thấy người dùng',
          description: `Đã tìm thấy: ${user.name} (${user.email})`,
        });
      }
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

  const handleAddToList = () => {
    if (!foundUser) return;
    setFoundUsers((prev) => [
      ...prev,
      { ...foundUser, deadlineDays: 7, onExpireAction: "remove" }, // mặc định
    ]);
    setFoundUser(null);
    setEmail('');
  };


  const handleRemoveUser = (id: number) => {
    setFoundUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleAssign = async () => {
    if (foundUsers.length === 0 || !contract) return;
    try {
      await addRecipientMutate({
        contractId: contract.id,
        senderId: contract.createdBy.id,
        recipientItems: foundUsers.map((u) => ({
          userId: u.id,
          deadlineDays: u.deadlineDays,
          onExpireAction: u.onExpireAction,
        })),
      });
      toast({
        title: 'Gán thành công!',
        description: `Đã gán ${foundUsers.length} người vào hợp đồng.`,
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

        <h2 className="mb-2 text-xl font-bold text-gray-800">Gán người dùng</h2>
        <p className="mb-4 text-sm text-gray-500">
          Hợp đồng: <span className="font-medium text-gray-700">{contract.title}</span>
        </p>

        {/* Form tìm kiếm */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email người dùng</label>
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
                className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium ${isSearching
                  ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
            </div>
          </div>
        </form>

        {/* Nếu tìm thấy 1 người */}
        {foundUser && (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="font-medium text-blue-800">{foundUser.name}</p>
            <p className="text-sm text-blue-700">{foundUser.email}</p>
            <button
              onClick={handleAddToList}
              className="mt-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            >
              Thêm vào danh sách
            </button>
          </div>
        )}

        {/* Danh sách nhiều người */}
        {foundUsers.length > 0 && (
          <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Danh sách người dùng đã chọn</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {foundUsers.map((user, index) => (
                <li key={user.id} className="flex flex-col gap-2 rounded-md bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Deadline input */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <label>Thời hạn (ngày):</label>
                    <input
                      type="number"
                      min={1}
                      value={user.deadlineDays || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || undefined;
                        setFoundUsers(prev =>
                          prev.map((u, i) => (i === index ? { ...u, deadlineDays: value } : u))
                        );
                      }}
                      className="w-16 rounded-md border px-2 py-1 text-sm"
                    />

                    <label>Hết hạn:</label>
                    <select
                      value={user.onExpireAction}
                      onChange={(e) => {
                        const value = e.target.value as "cancel" | "remove" | "extend";
                        setFoundUsers(prev =>
                          prev.map((u, i) => (i === index ? { ...u, onExpireAction: value } : u))
                        );
                      }}
                      className="rounded-md border px-2 py-1 text-sm"
                    >
                      <option value="remove">Xóa</option>
                      <option value="cancel">Hủy</option>
                      <option value="extend">Gia hạn</option>
                    </select>
                  </div>
                </li>
              ))}

            </ul>
          </div>
        )}

        {/* Nút gán tất cả + hủy */}
        <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={isAssigning || foundUsers.length === 0}
            className={`inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white ${isAssigning ? 'cursor-not-allowed opacity-70' : 'hover:bg-indigo-700'
              }`}
          >
            {isAssigning ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <User size={16} className="mr-2" />
            )}
            {isAssigning ? 'Đang gán...' : `Gán ${foundUsers.length} người`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractAssigner;
