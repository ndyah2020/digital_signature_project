import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Download } from 'lucide-react';
import DataTable from '../components/DataTable';
import ContractUploader from '../components/ContractUploader';
import { useToast } from '../components/ui/use-toast';
import { formatDate, formatContractStatus } from '../utils/helpers';
import { ContractType } from '../type/contract.type';
import { useMutation } from '../hooks/useMutation';
import { createContract } from '../api/contract.api';


const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        // In a real app, this would be a real API call
        // const response = await api.get('/contracts')
        // setContracts(response.data)
        // Mocking data for demonstration
        setContracts([{
          id: 'HD001',
          name: 'Hợp đồng mua bán hàng hóa',
          status: 'signed',
          creator: 'Nguyễn Văn A',
          createdAt: '2023-06-10T10:30:00Z',
          hash: '8a9d8f7e6c5b4a3',
          fileType: 'pdf',
          fileSize: 1024000
        }, {
          id: 'HD002',
          name: 'Hợp đồng thuê nhà',
          status: 'pending',
          creator: 'Trần Thị B',
          createdAt: '2023-06-12T14:15:00Z',
          hash: '1b2c3d4e5f6g7h',
          fileType: 'docx',
          fileSize: 512000
        }, {
          id: 'HD003',
          name: 'Hợp đồng hợp tác kinh doanh',
          status: 'draft',
          creator: 'Lê Văn C',
          createdAt: '2023-06-14T09:45:00Z',
          hash: '9i8u7y6t5r4e3w',
          fileType: 'pdf',
          fileSize: 768000
        }, {
          id: 'HD004',
          name: 'Hợp đồng lao động',
          status: 'cancelled',
          creator: 'Phạm Thị D',
          createdAt: '2023-06-08T16:20:00Z',
          hash: '2q3w4e5r6t7y8u',
          fileType: 'pdf',
          fileSize: 640000
        }]);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách hợp đồng. Vui lòng thử lại sau.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [toast]);

  const { mutate } = useMutation(createContract, {
    onSuccess: () => {
      toast({
        title: "✅ Tạo hợp đồng thành công!",
        description: "Hợp đồng của bạn đã được lưu trữ an toàn.",
      });
    },
    onError: (err) => {
      toast({
        title: "Lỗi tạo hợp đồng",
        description: err.message || "Không thể tạo hợp đồng.",
        variant: "destructive",
      });
    },
  });

  const handleContractUpload = async (contract: ContractType) => {
    await mutate({
      name: contract.name,
      description: contract.description,
      file: contract.file,
    });
  };
  
  const columns = [{
    id: 'id',
    header: 'Mã hợp đồng',
    cell: (contract: any) => <div className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
      <Link to={`/contracts/${contract.id}`}>{contract.id}</Link>
    </div>,
    sortable: true
  }, {
    id: 'name',
    header: 'Tên hợp đồng',
    cell: (contract: any) => <div className="text-sm text-gray-900">
      <Link to={`/contracts/${contract.id}`} className="hover:underline">
        {contract.name}
      </Link>
    </div>,
    sortable: true
  }, {
    id: 'status',
    header: 'Trạng thái',
    cell: (contract: any) => {
      const status = formatContractStatus(contract.status);
      return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
        {status.text}
      </span>;
    },
    sortable: true
  }, {
    id: 'creator',
    header: 'Người tạo',
    cell: (contract: any) => <div className="text-sm text-gray-500">{contract.creator}</div>,
    sortable: true
  }, {
    id: 'createdAt',
    header: 'Ngày tạo',
    cell: (contract: any) => <div className="text-sm text-gray-500">
      {formatDate(contract.createdAt)}
    </div>,
    sortable: true
  }, {
    id: 'actions',
    header: 'Hành động',
    cell: (contract: any) => <div className="flex space-x-2">
      <Link to={`/contracts/${contract.id}`} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
        <FileText className="mr-1 h-3 w-3" />
        Chi tiết
      </Link>
      <button className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
        <Download className="mr-1 h-3 w-3" />
        Tải xuống
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
      <h1 className="text-2xl font-bold text-gray-900">Quản lý hợp đồng</h1>
      <button onClick={() => setIsUploaderOpen(true)} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <Plus className="mr-2 h-5 w-5" />
        Tạo hợp đồng mới
      </button>
    </div>
    <div className="rounded-lg bg-white shadow">
      <div className="p-6">
        <DataTable columns={columns} data={contracts} pagination={true} searchable={true} itemsPerPage={10} />
      </div>
    </div>
    <ContractUploader isOpen={isUploaderOpen} onClose={() => setIsUploaderOpen(false)} onUpload={handleContractUpload} />
  </div>;
};
export default Contracts;