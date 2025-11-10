import React, { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import { useToast } from '../components/ui/use-toast';
import { formatDate } from '../utils/helpers';
import useFetch from '../hooks/useFetch';
import { UserData } from '../type/auth.type';
const Users: React.FC = () => {
  // const { toast } = useToast();
  const {data: users, loading: isUsers} = useFetch<UserData[]>("/users/");
  // const handleDeleteUser = async (userId: string) => {
  //   if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
  //   try {
  //     setUsers(users.filter(user => user.id !== userId));
  //     toast({
  //       title: 'Thành công',
  //       description: 'Người dùng đã được xóa thành công.'
  //     });
  //   } catch (error) {
  //     console.error('Error deleting user:', error);
  //     toast({
  //       title: 'Lỗi',
  //       description: 'Không thể xóa người dùng. Vui lòng thử lại sau.',
  //       variant: 'destructive'
  //     });
  //   }
  // };

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
  }, 
  // {
  //   id: 'lastLogin',
  //   header: 'Đăng nhập cuối',
  //   cell: (user: any) => <div className="text-sm text-gray-500">
  //         {formatDate(user.lastLogin)}
  //       </div>,
  //   sortable: true
  // }, {
  //   id: 'actions',
  //   header: 'Hành động',
  //   cell: (user: any) => <div className="flex space-x-2">
  //         <button className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
  //           <Edit className="mr-1 h-3 w-3" />
  //           Sửa
  //         </button>
  //         <button onClick={() => handleDeleteUser(user.id)} className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
  //           <Trash2 className="mr-1 h-3 w-3" />
  //           Xóa
  //         </button>
  //       </div>
  // }
  ];
  if (isUsers) {
    return <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>;
  }
  return <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <div className="flex space-x-3">
          {/* <button className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <UserPlus className="mr-2 h-5 w-5" />
            Gán vai trò
          </button>
          <button className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Plus className="mr-2 h-5 w-5" />
            Thêm người dùng
          </button> */}
        </div>
      </div>
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <DataTable columns={columns} data={users || []} pagination={true} searchable={true} itemsPerPage={10} />
        </div>
      </div>
    </div>;
};
export default Users;