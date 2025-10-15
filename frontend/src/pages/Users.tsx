import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import DataTable from '../components/DataTable';
import { api } from '../utils/api';
import { useToast } from '../components/ui/use-toast';
import { formatDate } from '../utils/helpers';
const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real app, this would be a real API call
        // const response = await api.get('/users')
        // setUsers(response.data)
        // Mocking data for demonstration
        setUsers([{
          id: 'user1',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          role: 'admin',
          createdAt: '2023-05-01T10:00:00Z',
          lastLogin: '2023-06-15T08:30:00Z'
        }, {
          id: 'user2',
          name: 'Trần Thị B',
          email: 'tranthib@example.com',
          role: 'manager',
          createdAt: '2023-05-05T14:00:00Z',
          lastLogin: '2023-06-14T09:15:00Z'
        }, {
          id: 'user3',
          name: 'Lê Văn C',
          email: 'levanc@example.com',
          role: 'user',
          createdAt: '2023-05-10T11:30:00Z',
          lastLogin: '2023-06-13T10:45:00Z'
        }, {
          id: 'user4',
          name: 'Phạm Thị D',
          email: 'phamthid@example.com',
          role: 'user',
          createdAt: '2023-05-15T09:00:00Z',
          lastLogin: '2023-06-12T14:20:00Z'
        }]);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách người dùng. Vui lòng thử lại sau.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      // In a real app, this would be a real API call
      // await api.delete(`/users/${userId}`)
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: 'Thành công',
        description: 'Người dùng đã được xóa thành công.'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa người dùng. Vui lòng thử lại sau.',
        variant: 'destructive'
      });
    }
  };
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
            Admin
          </span>;
      case 'manager':
        return <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            Quản lý
          </span>;
      case 'user':
        return <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Người dùng
          </span>;
      default:
        return <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
            {role}
          </span>;
    }
  };
  const columns = [{
    id: 'name',
    header: 'Tên người dùng',
    cell: (user: any) => <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xs font-medium text-indigo-800">
              {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>,
    sortable: true
  }, {
    id: 'email',
    header: 'Email',
    cell: (user: any) => <div className="text-sm text-gray-500">{user.email}</div>,
    sortable: true
  }, {
    id: 'role',
    header: 'Vai trò',
    cell: (user: any) => getRoleBadge(user.role),
    sortable: true
  }, {
    id: 'createdAt',
    header: 'Ngày tạo',
    cell: (user: any) => <div className="text-sm text-gray-500">
          {formatDate(user.createdAt)}
        </div>,
    sortable: true
  }, {
    id: 'lastLogin',
    header: 'Đăng nhập cuối',
    cell: (user: any) => <div className="text-sm text-gray-500">
          {formatDate(user.lastLogin)}
        </div>,
    sortable: true
  }, {
    id: 'actions',
    header: 'Hành động',
    cell: (user: any) => <div className="flex space-x-2">
          <button className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
            <Edit className="mr-1 h-3 w-3" />
            Sửa
          </button>
          <button onClick={() => handleDeleteUser(user.id)} className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
            <Trash2 className="mr-1 h-3 w-3" />
            Xóa
          </button>
        </div>
  }];
  if (loading) {
    return <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>;
  }
  return <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <UserPlus className="mr-2 h-5 w-5" />
            Gán vai trò
          </button>
          <button className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Plus className="mr-2 h-5 w-5" />
            Thêm người dùng
          </button>
        </div>
      </div>
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <DataTable columns={columns} data={users} pagination={true} searchable={true} itemsPerPage={10} />
        </div>
      </div>
    </div>;
};
export default Users;