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
import useFetch from "../hooks/useFetch";
import { AuditLogType } from "../type/auditLog.type";
import { DashboardStats } from "../type/stats.type";

const translateAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    CREATE_CONTRACT: 'Tạo hợp đồng',
    SIGN_CONTRACT: 'Ký hợp đồng',
    ASSIGN_CONTRACT: 'Phân công hợp đồng',
    CONTRACT_FULLY_SIGNED: 'Hợp đồng đã được ký đầy đủ',
    LOGIN: 'Đăng nhập hệ thống',
    LOGOUT: 'Đăng xuất hệ thống',
    ADD_USER: 'Thêm người dùng mới',
    CANCEL_CONTRACT: 'Hủy hợp đồng',
  };
  return actionMap[action] || action;
};

const getActionBadge = (action: string) => {
  const actionColors: Record<string, string> = {
    CREATE_CONTRACT: 'bg-blue-100 text-blue-800',
    SIGN_CONTRACT: 'bg-indigo-100 text-indigo-800',
    ASSIGN_CONTRACT: 'bg-purple-100 text-purple-800',
    CONTRACT_FULLY_SIGNED: 'bg-green-100 text-green-800',
    LOGIN: 'bg-green-100 text-green-800',
    LOGOUT: 'bg-gray-100 text-gray-800',
    ADD_USER: 'bg-purple-100 text-purple-800',
    CANCEL_CONTRACT: 'bg-red-100 text-red-800',
  };
  const color = actionColors[action] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      {translateAction(action)}
    </span>
  );
};

const Dashboard: React.FC = () => {

  const { user } = useAuth();
  const { data: dashboardStats, loading: isDashboardStats } = useFetch<DashboardStats>('/stats/dashboard-stats');
  const { data: auditLogs, loading: isAuditLogs } = useFetch<AuditLogType[]>('/audit-logs', { limit: 5 });

  const handleGetLogs = () => {
    if (!auditLogs) {
      return [];
    }
    return auditLogs
  }

  const isAdminCheck = () => {
    if (user?.role === 'admin' && dashboardStats?.usersStats)
      return true;
    return false;
  }

  const contractStatusData = (dashboardStats?.contractsStats) ? [
    { name: "Chờ ký", value: dashboardStats.contractsStats.pending || 0, color: "#FBBF24" },
    { name: "Đã ký", value: dashboardStats.contractsStats.signed || 0, color: "#34D399" },
    { name: "Đã hủy", value: dashboardStats.contractsStats.cancelled || 0, color: "#F87171" },
    { name: "Bản nháp", value: dashboardStats.contractsStats.draft || 0, color: "#94A3B8" },
  ] : [];

  const userRolesData = (dashboardStats?.usersStats) ? [
    { name: "Admin", value: dashboardStats.usersStats.admin || 0, color: "#4F46E5" },
    { name: "Người xem", value: dashboardStats.usersStats.viewer || 0, color: "#8B5CF6" },
    { name: "Ký tên", value: dashboardStats.usersStats.signer || 0, color: "#A78BFA" },
  ] : [];

  if (isDashboardStats || isAuditLogs) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="flex h-full items-center justify-center text-red-600">
        Lỗi: Không thể tải dữ liệu Bảng điều khiển.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>

      <div
        className={`grid grid-cols-1 gap-6 ${
          dashboardStats.usersStats ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"
          }`}
      >
        <StatCard
          icon={<FileText className="h-6 w-6 text-indigo-600" />}
          bg="bg-indigo-100"
          label="Tổng số hợp đồng"
          value={dashboardStats.contractsStats.total || 0}
        />
        <StatCard
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          bg="bg-yellow-100"
          label="Chờ ký"
          value={dashboardStats.contractsStats.pending || 0}
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          bg="bg-green-100"
          label="Đã ký"
          value={dashboardStats.contractsStats.signed || 0}
        />

        {isAdminCheck() && (
          <StatCard
            icon={<Users className="h-6 w-6 text-purple-600" />}
            bg="bg-purple-100"
            label="Người dùng"
            value={dashboardStats.contractsStats?.total || 0}
          />
        )}
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${isAdminCheck() ? "lg:grid-cols-2" : "lg:grid-cols-1"
          }`}
      >
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

        {isAdminCheck() && (
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

      {isAdminCheck() && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Hoạt động gần đây
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th text="ID" />
                  <Th text="Người dùng" />
                  <Th text="Hành động" />
                  <Th text="Chi tiết" />
                  <Th text="Thời gian" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {handleGetLogs().map((log) => (
                  <tr key={log.id}>
                    <Td>{log.id}</Td>
                    <Td bold>{log.user.name}</Td>
                    <Td>{getActionBadge(log.action)}</Td>
                    <Td>{log.details}</Td>
                    <Td>
                      {new Date(log.createdAt).toLocaleString("vi-VN", {
                        hour12: false,
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Td>
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
        <p className="text-2xl font-semibold text-gray-900">{typeof value === 'number' ? value : 0}</p>
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

const Th: React.FC<{ text: string }> = ({ text }) => (
  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
    {text}
  </th>
);

const Td: React.FC<{ children: React.ReactNode; bold?: boolean }> = ({ children, bold }) => (
  <td className="whitespace-nowrap px-6 py-4 align-top">
    <div className={`text-sm ${bold ? "font-medium text-gray-900" : "text-gray-500"}`}>
      {children}
    </div>
  </td>
);

export default Dashboard;