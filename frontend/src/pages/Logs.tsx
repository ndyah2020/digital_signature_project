import DataTable from '../components/DataTable';
import { formatDate } from '../utils/helpers';
import useFetch from '../hooks/useFetch';
import { AuditLogType } from '../type/auditLog.type';
const Logs: React.FC = () => {
  
  const { data: auditLog, loading: isAuditLog } = useFetch<AuditLogType[]>("/audit-logs");
  const translateAction = (action: string): string => {
    const actionMap: Record<string, string> = {
      CREATE_CONTRACT: 'Tạo hợp đồng',
      SIGN_CONTRACT: 'Ký hợp đồng',
      ASSIGN_CONTRACT: 'Phân công hợp đồng',
      CONTRACT_FULLY_SIGNED: 'Hợp đồng đã được ký đầy đủ',
      LOGIN: 'Đăng nhập hệ thống',
      LOGOUT: 'Đăng xuất hệ thống',
    };
    return actionMap[action] || action;
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      CREATE_CONTRACT: 'bg-blue-100 text-blue-800',
      SIGN_CONTRACT: 'bg-indigo-100 text-indigo-800',
      ASSIGN_CONTRACT: 'bg-purple-100 text-purple-800',
      CONTRACT_FULLY_SIGNED: 'bg-green-100 text-blue-800',
      LOGIN: 'bg-green-100 text-green-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
    };

    const color = actionColors[action] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${color}`}>
        {translateAction(action)}
      </span>
    );
  };


  const columns = [{
    id: 'user',
    header: 'Người dùng',
    cell: (auditLog: AuditLogType) => <div className="text-sm font-medium text-gray-900">{auditLog.user.name}</div>,
    sortable: true
  }, {
    id: 'action',
    header: 'Hành động',
    cell: (auditLog: AuditLogType) => getActionBadge(auditLog.action),
    sortable: true
  }, {
    id: 'details',
    header: 'Chi tiết',
    cell: (auditLog: AuditLogType) => <div className="text-sm text-gray-500">{auditLog.details}</div>,
    sortable: true
  }, {
    id: 'timestamp',
    header: 'Thời gian',
    cell: (auditLog: AuditLogType) => <div className="text-sm text-gray-500">{formatDate(auditLog.createdAt)}</div>,
    sortable: true
  }
  ];
  if (isAuditLog) {
    return <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>;
  }
  return <div>
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Nhật ký hệ thống</h1>
      {/* <button className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        <Download className="mr-2 h-5 w-5" />
        Xuất nhật ký
      </button> */}
    </div>
    <div className="rounded-lg bg-white shadow">
      <div className="p-6">
        <DataTable columns={columns} data={auditLog || []} pagination={true} searchable={true} itemsPerPage={10} />
      </div>
    </div>
  </div>;
};
export default Logs;