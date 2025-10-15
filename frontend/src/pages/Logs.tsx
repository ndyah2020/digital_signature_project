import React, { useEffect, useState } from 'react';
import { ClipboardList, Download } from 'lucide-react';
import DataTable from '../components/DataTable';
import { api } from '../utils/api';
import { useToast } from '../hooks/use-toast';
import { formatDate } from '../utils/helpers';
const Logs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // In a real app, this would be a real API call
        // const response = await api.get('/logs')
        // setLogs(response.data)
        // Mocking data for demonstration
        setLogs([{
          id: 'log1',
          user: 'Nguyễn Văn A',
          action: 'Đăng nhập',
          timestamp: '2023-06-15T10:30:00Z',
          ip: '192.168.1.1',
          details: 'Đăng nhập thành công'
        }, {
          id: 'log2',
          user: 'Trần Thị B',
          action: 'Tạo hợp đồng mới',
          timestamp: '2023-06-15T11:15:00Z',
          ip: '192.168.1.2',
          details: 'Hợp đồng #HD002'
        }, {
          id: 'log3',
          user: 'Lê Văn C',
          action: 'Ký hợp đồng',
          timestamp: '2023-06-15T12:05:00Z',
          ip: '192.168.1.3',
          details: 'Hợp đồng #HD001'
        }, {
          id: 'log4',
          user: 'Phạm Thị D',
          action: 'Hủy hợp đồng',
          timestamp: '2023-06-15T14:20:00Z',
          ip: '192.168.1.4',
          details: 'Hợp đồng #HD003'
        }, {
          id: 'log5',
          user: 'Hoàng Văn E',
          action: 'Thêm người dùng mới',
          timestamp: '2023-06-15T15:45:00Z',
          ip: '192.168.1.5',
          details: 'User: newuser@example.com'
        }, {
          id: 'log6',
          user: 'Nguyễn Văn A',
          action: 'Đăng xuất',
          timestamp: '2023-06-15T16:30:00Z',
          ip: '192.168.1.1',
          details: 'Đăng xuất thành công'
        }, {
          id: 'log7',
          user: 'Trần Thị B',
          action: 'Cập nhật hợp đồng',
          timestamp: '2023-06-15T17:15:00Z',
          ip: '192.168.1.2',
          details: 'Hợp đồng #HD002'
        }]);
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải nhật ký hệ thống. Vui lòng thử lại sau.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [toast]);
  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      'Đăng nhập': 'bg-green-100 text-green-800',
      'Đăng xuất': 'bg-gray-100 text-gray-800',
      'Tạo hợp đồng mới': 'bg-blue-100 text-blue-800',
      'Ký hợp đồng': 'bg-indigo-100 text-indigo-800',
      'Hủy hợp đồng': 'bg-red-100 text-red-800',
      'Cập nhật hợp đồng': 'bg-yellow-100 text-yellow-800',
      'Thêm người dùng mới': 'bg-purple-100 text-purple-800'
    };
    const color = actionColors[action] || 'bg-gray-100 text-gray-800';
    return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${color}`}>
        {action}
      </span>;
  };
  const columns = [{
    id: 'user',
    header: 'Người dùng',
    cell: (log: any) => <div className="text-sm font-medium text-gray-900">{log.user}</div>,
    sortable: true
  }, {
    id: 'action',
    header: 'Hành động',
    cell: (log: any) => getActionBadge(log.action),
    sortable: true
  }, {
    id: 'details',
    header: 'Chi tiết',
    cell: (log: any) => <div className="text-sm text-gray-500">{log.details}</div>,
    sortable: true
  }, {
    id: 'timestamp',
    header: 'Thời gian',
    cell: (log: any) => <div className="text-sm text-gray-500">{formatDate(log.timestamp)}</div>,
    sortable: true
  }, {
    id: 'ip',
    header: 'Địa chỉ IP',
    cell: (log: any) => <div className="text-sm font-mono text-gray-500">{log.ip}</div>,
    sortable: true
  }];
  if (loading) {
    return <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>;
  }
  return <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nhật ký hệ thống</h1>
        <button className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <Download className="mr-2 h-5 w-5" />
          Xuất nhật ký
        </button>
      </div>
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <DataTable columns={columns} data={logs} pagination={true} searchable={true} itemsPerPage={10} />
        </div>
      </div>
    </div>;
};
export default Logs;