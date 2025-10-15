import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import DataTable from '../components/DataTable';
import { api } from '../utils/api';
import { useToast } from '../hooks/use-toast';
const Roles: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // In a real app, this would be a real API call
        // const response = await api.get('/roles')
        // setRoles(response.data)
        // Mocking data for demonstration
        setRoles([{
          id: 'role1',
          name: 'Admin',
          description: 'Quản trị viên hệ thống',
          permissions: ['manage_users', 'create_contract', 'sign_contract', 'view_contract'],
          userCount: 3
        }, {
          id: 'role2',
          name: 'Manager',
          description: 'Quản lý',
          permissions: ['create_contract', 'sign_contract', 'view_contract'],
          userCount: 12
        }, {
          id: 'role3',
          name: 'User',
          description: 'Người dùng thông thường',
          permissions: ['view_contract', 'sign_contract'],
          userCount: 30
        }]);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách vai trò. Vui lòng thử lại sau.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [toast]);
  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vai trò này?')) return;
    try {
      // In a real app, this would be a real API call
      // await api.delete(`/roles/${roleId}`)
      // Update local state
      setRoles(roles.filter(role => role.id !== roleId));
      toast({
        title: 'Thành công',
        description: 'Vai trò đã được xóa thành công.'
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa vai trò. Vui lòng thử lại sau.',
        variant: 'destructive'
      });
    }
  };
  const getPermissionBadges = (permissions: string[]) => {
    const permissionLabels: Record<string, {
      text: string;
      color: string;
    }> = {
      manage_users: {
        text: 'Quản lý người dùng',
        color: 'bg-purple-100 text-purple-800'
      },
      create_contract: {
        text: 'Tạo hợp đồng',
        color: 'bg-blue-100 text-blue-800'
      },
      sign_contract: {
        text: 'Ký hợp đồng',
        color: 'bg-green-100 text-green-800'
      },
      view_contract: {
        text: 'Xem hợp đồng',
        color: 'bg-gray-100 text-gray-800'
      }
    };
    return <div className="flex flex-wrap gap-1">
        {permissions.map(permission => {
        const badge = permissionLabels[permission] || {
          text: permission,
          color: 'bg-gray-100 text-gray-800'
        };
        return <span key={permission} className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}>
              {badge.text}
            </span>;
      })}
      </div>;
  };
  const columns = [{
    id: 'name',
    header: 'Tên vai trò',
    cell: (role: any) => <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
            <Shield className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{role.name}</div>
            <div className="text-xs text-gray-500">{role.description}</div>
          </div>
        </div>,
    sortable: true
  }, {
    id: 'permissions',
    header: 'Quyền',
    cell: (role: any) => getPermissionBadges(role.permissions),
    sortable: false
  }, {
    id: 'userCount',
    header: 'Số người dùng',
    cell: (role: any) => <div className="text-sm text-gray-500">{role.userCount}</div>,
    sortable: true
  }, {
    id: 'actions',
    header: 'Hành động',
    cell: (role: any) => <div className="flex space-x-2">
          <button className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
            <Edit className="mr-1 h-3 w-3" />
            Sửa
          </button>
          <button onClick={() => handleDeleteRole(role.id)} className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100" disabled={role.name === 'Admin'} // Prevent deleting the Admin role
      >
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý vai trò</h1>
        <button className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <Plus className="mr-2 h-5 w-5" />
          Thêm vai trò mới
        </button>
      </div>
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <DataTable columns={columns} data={roles} pagination={true} searchable={true} itemsPerPage={10} />
        </div>
      </div>
    </div>;
};
export default Roles;