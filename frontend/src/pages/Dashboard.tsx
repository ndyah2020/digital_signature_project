import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis } from 'recharts';
import { FileText, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

interface UserLog {
  id: number; 
  user: string;
  action: string;
  timestamp: string; 
  ip: string;
}
interface Stats {
  contracts: {
    total: number;
    pending: number;
    signed: number;
    cancelled: number;
    draft: number;
  };
  users: {
    total: number;
    admin: number;
    manager: number;
    user: number;
  };
  recentLogs: UserLog[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    contracts: {
      total: 0,
      pending: 0,
      signed: 0,
      cancelled: 0,
      draft: 0,
    },
    users: {
      total: 0,
      admin: 0,
      manager: 0,
      user: 0,
    },
    recentLogs: [],
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStats({
          contracts: {
            total: 120,
            pending: 35,
            signed: 68,
            cancelled: 7,
            draft: 10
          },
          users: {
            total: 45,
            admin: 3,
            manager: 12,
            user: 30
          },
          recentLogs: [{
            id: 1,
            user: 'Nguyễn Văn A',
            action: 'Đăng nhập',
            timestamp: '2023-06-15T10:30:00Z',
            ip: '192.168.1.1'
          }, {
            id: 2,
            user: 'Trần Thị B',
            action: 'Tạo hợp đồng mới',
            timestamp: '2023-06-15T11:15:00Z',
            ip: '192.168.1.2'
          }, {
            id: 3,
            user: 'Lê Văn C',
            action: 'Ký hợp đồng #HD001',
            timestamp: '2023-06-15T12:05:00Z',
            ip: '192.168.1.3'
          }, {
            id: 4,
            user: 'Phạm Thị D',
            action: 'Hủy hợp đồng #HD002',
            timestamp: '2023-06-15T14:20:00Z',
            ip: '192.168.1.4'
          }, {
            id: 5,
            user: 'Hoàng Văn E',
            action: 'Thêm người dùng mới',
            timestamp: '2023-06-15T15:45:00Z',
            ip: '192.168.1.5'
          }]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  const contractStatusData = [{
    name: 'Chờ ký',
    value: stats.contracts.pending,
    color: '#FBBF24'
  }, {
    name: 'Đã ký',
    value: stats.contracts.signed,
    color: '#34D399'
  }, {
    name: 'Đã hủy',
    value: stats.contracts.cancelled,
    color: '#F87171'
  }, {
    name: 'Bản nháp',
    value: stats.contracts.draft,
    color: '#94A3B8'
  }];
  const userRolesData = [{
    name: 'Admin',
    value: stats.users.admin,
    color: '#4F46E5'
  }, {
    name: 'Quản lý',
    value: stats.users.manager,
    color: '#8B5CF6'
  }, {
    name: 'Người dùng',
    value: stats.users.user,
    color: '#A78BFA'
  }];
  if (loading) {
    return <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>;
  }
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">
              Tổng số hợp đồng
            </h3>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.contracts.total}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Chờ ký</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.contracts.pending}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Đã ký</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.contracts.signed}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Người dùng</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.users.total}
            </p>
          </div>
        </div>
      </div>
    </div>
    {/* Charts */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Trạng thái hợp đồng
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contractStatusData} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Số lượng">
                {contractStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Phân bổ người dùng
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={userRolesData} cx="50%" cy="50%" labelLine={false} label={({
                name,
                percent
              }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {userRolesData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    {/* Recent Logs */}
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        Hoạt động gần đây
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Người dùng
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Hành động
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Thời gian
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                IP
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {stats.recentLogs.map((log: any) => <tr key={log.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {log.user}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-500">{log.action}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-500">{log.ip}</div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
};
export default Dashboard;