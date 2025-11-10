import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart, 
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Thêm lại interface UserLog
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
  // Thêm lại 'users' và 'recentLogs'
  users: {
    total: number;
    admin: number;
    manager: number;
    user: number;
  };
  recentLogs: UserLog[];
}

const Dashboard: React.FC = () => {
  const { isAuthenticated} = useAuth();


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
        // Giả lập dữ liệu (chứa tất cả dữ liệu)
        const mockData: Stats = {
          contracts: {
            total: 120,
            pending: 35,
            signed: 68,
            cancelled: 7,
            draft: 10,
          },
          // Thêm lại mock data cho 'users' và 'recentLogs'
          users: {
            total: 45,
            admin: 3,
            manager: 12,
            user: 30,
          },
          recentLogs: [
            {
              id: 1,
              user: "Nguyễn Văn A",
              action: "Đăng nhập",
              timestamp: "2023-06-15T10:30:00Z",
              ip: "192.168.1.1",
            },
            {
              id: 2,
              user: "Trần Thị B",
              action: "Tạo hợp đồng mới",
              timestamp: "2023-06-15T11:15:00Z",
              ip: "192.168.1.2",
            },
            {
              id: 3,
              user: "Lê Văn C",
              action: "Ký hợp đồng #HD001",
              timestamp: "2023-06-15T12:05:00Z",
              ip: "192.168.1.3",
            },
            {
              id: 4,
              user: "Phạm Thị D",
              action: "Hủy hợp đồng #HD002",
              timestamp: "2023-06-15T14:20:00Z",
              ip: "192.168.1.4",
            },
            {
              id: 5,
              user: "Hoàng Văn E",
              action: "Thêm người dùng mới",
              timestamp: "2023-06-15T15:45:00Z",
              ip: "192.168.1.5",
            },
          ],
        };

        // Giả lập thời gian tải dữ liệu
        setTimeout(() => {
          setStats(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const contractStatusData = [
    { name: "Chờ ký", value: stats.contracts.pending, color: "#FBBF24" },
    { name: "Đã ký", value: stats.contracts.signed, color: "#34D399" },
    { name: "Đã hủy", value: stats.contracts.cancelled, color: "#F87171" },
    { name: "Bản nháp", value: stats.contracts.draft, color: "#94A3B8" },
  ];

  // Thêm lại 'userRolesData'
  const userRolesData = [
    { name: "Admin", value: stats.users.admin, color: "#4F46E5" },
    { name: "Quản lý", value: stats.users.manager, color: "#8B5CF6" },
    { name: "Người dùng", value: stats.users.user, color: "#A78BFA" },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>

      {/* Thống kê nhanh - Cập nhật grid cols động */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          isAuthenticated ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"
        }`}
      >
        {/* Tổng hợp đồng */}
        <StatCard
          icon={<FileText className="h-6 w-6 text-indigo-600" />}
          bg="bg-indigo-100"
          label="Tổng số hợp đồng"
          value={stats.contracts.total}
        />
        {/* Chờ ký */}
        <StatCard
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          bg="bg-yellow-100"
          label="Chờ ký"
          value={stats.contracts.pending}
        />
        {/* Đã ký */}
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          bg="bg-green-100"
          label="Đã ký"
          value={stats.contracts.signed}
        />
        {/* Thẻ "Người dùng" - Chỉ hiển thị cho Admin/Manager */}
        {isAuthenticated && (
          <StatCard
            icon={<Users className="h-6 w-6 text-purple-600" />}
            bg="bg-purple-100"
            label="Người dùng"
            value={stats.users.total}
          />
        )}
      </div>

      {/* Biểu đồ - Cập nhật grid cols động */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          isAuthenticated ? "lg:grid-cols-2" : "lg:grid-cols-1"
        }`}
      >
        {/* Bar chart trạng thái hợp đồng */}
        <ChartCard title="Trạng thái hợp đồng">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contractStatusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Số lượng">
                {contractStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie chart phân bổ người dùng - Chỉ hiển thị cho Admin/Manager */}
        {isAuthenticated && (
          <ChartCard title="Phân bổ người dùng">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRolesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {userRolesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Bảng hoạt động gần đây - Chỉ hiển thị cho Admin/Manager */}
      {isAuthenticated && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Hoạt động gần đây
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th text="Người dùng" />
                  <Th text="Hành động" />
                  <Th text="Thời gian" />
                  <Th text="Địa chỉ IP" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {stats.recentLogs.map((log) => (
                  <tr key={log.id}>
                    <Td text={log.user} bold />
                    <Td text={log.action} />
                    <Td
                      text={new Date(log.timestamp).toLocaleString("vi-VN", {
                        hour12: false,
                      })}
                    />
                    <Td text={log.ip} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


interface StatCardProps {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, bg, label, value }) => (
  <div className="rounded-lg bg-white p-6 shadow transition hover:shadow-md">
    <div className="flex items-center">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <div className="rounded-lg bg-white p-6 shadow">
    <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
    <div className="h-64">{children}</div>
  </div>
);

// Thêm lại component 'Th' và 'Td'
const Th: React.FC<{ text: string }> = ({ text }) => (
  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
    {text}
  </th>
);

const Td: React.FC<{ text: string; bold?: boolean }> = ({ text, bold }) => (
  <td className="whitespace-nowrap px-6 py-4">
    <div className={`text-sm ${bold ? "font-medium text-gray-900" : "text-gray-500"}`}>
      {text}
    </div>
  </td>
);

export default Dashboard;