import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Download } from 'lucide-react';
import DataTable from '../components/DataTable';
import ContractUploader from '../components/ContractUploader';
import ContractEditor from "../components/ContractEditor";
import { useToast } from '../components/ui/use-toast';
import { formatDate, formatContractStatus } from '../utils/helpers';
import { useMutation } from '../hooks/useMutation';
import { createContract, updateContract, updateContractStatus } from '../api/contract.api';
import { ContractDataType, ContractUpdateType, ContractType } from '../type/contract.type'
import useFetch from '../hooks/useFetch';
const Contracts: React.FC = () => {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const { toast } = useToast();
  const { data: contracts, loading, error, refetch } = useFetch<ContractDataType[]>("/contracts");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractDataType | null>(null);
  // Tạo hợp đồng
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

  // cập nhật hợp đồng
  const { mutate: mutateUpdate } = useMutation(updateContract, {
    onSuccess: () => {
      toast({
        title: "✅ Cập nhật hợp đồng thành công!",
        description: "Thông tin hợp đồng đã được cập nhật.",
      });
      refetch();
      setIsEditOpen(false);
    },
    onError: (err) => {
      toast({
        title: "Lỗi cập nhật hợp đồng",
        description: err.message || "Không thể cập nhật hợp đồng.",
        variant: "destructive",
      });
    },
  });


  const handleSaveEdit = async (contract: ContractUpdateType) => {
    await mutateUpdate({
      id: contract.id,
      title: contract.title,
      description: contract.description,
      file: contract.file,
    });
  };

  const {
    mutate: mutateStatus,
    isLoading: isUpdatingStatus,
  } = useMutation(updateContractStatus, {
    onSuccess: (data) => {
      toast({
        title: "✅ Cập nhật trạng thái thành công!",
        description: `Hợp đồng đã chuyển sang trạng thái "${data.status}".`,
      });
      refetch();
    },
    onError: (err) => {
      toast({
        title: "Lỗi cập nhật trạng thái",
        description: err.message || "Không thể thay đổi trạng thái hợp đồng.",
        variant: "destructive",
      });
    },
  });



  const columns = [{
    id: 'id',
    header: 'Mã hợp đồng',
    cell: (contract: ContractDataType) => <div className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
      <Link to={`/contracts/${contract.id}`}>{contract.id}</Link>
    </div>,
    sortable: true
  }, {
    id: 'name',
    header: 'Tên hợp đồng',
    cell: (contract: ContractDataType) => <div className="text-sm text-gray-900">
      <Link to={`/contracts/${contract.id}`} className="hover:underline">
        {contract.title}
      </Link>
    </div>,
    sortable: true
  }, {
    id: 'status',
    header: 'Trạng thái',
    cell: (contract: ContractDataType) => (
      <select
        value={contract.status}
        onChange={(e) =>
          mutateStatus({
            id: contract.id,
            status: e.target.value as "draft" | "pending" | "signed" | "cancelled",
          })
        }
        disabled={isUpdatingStatus}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none"
      >
        <option value="draft">Bản nháp</option>
        <option value="pending">Chờ ký</option>
        <option value="signed">Đã ký</option>
        <option value="cancelled">Đã hủy</option>
      </select>
    ),
    sortable: true,
  },

  // {
  //   id: 'creator',
  //   header: 'Người tạo',
  //   cell: (contract: ContractDataType) => <div className="text-sm text-gray-500">{contract.creator}</div>,
  //   sortable: true
  // },
  {
    id: 'createdAt',
    header: 'Ngày tạo',
    cell: (contract: ContractDataType) => <div className="text-sm text-gray-500">
      {formatDate(contract.createdAt)}
    </div>,
    sortable: true
  }, {
    id: 'actions',
    header: 'Hành động',
    cell: (contract: ContractDataType) => <div className="flex space-x-2">
      <Link to={`/contracts/${contract.id}`} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
        <FileText className="mr-1 h-3 w-3" />
        Chi tiết
      </Link>
      <button className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
        <Download className="mr-1 h-3 w-3" />
        Tải xuống
      </button>
      <button className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100"
        onClick={() => {
          setIsEditOpen(true);
          setSelectedContract(contract);
        }}
      >
        Cập nhật
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
        <DataTable columns={columns} data={contracts || []} pagination={true} searchable={true} itemsPerPage={10} />
      </div>
    </div>
    <ContractUploader isOpen={isUploaderOpen} onClose={() => setIsUploaderOpen(false)} onUpload={handleContractUpload} />
    <ContractEditor isOpen={isEditOpen} contract={selectedContract} onClose={() => setIsEditOpen(false)} onSave={handleSaveEdit} />
  </div>;
};
export default Contracts;