import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, User } from 'lucide-react';
import DataTable from '../components/DataTable';
import ContractUploader from '../components/ContractUploader';
import ContractEditor from "../components/ContractEditor";
import ContractAssigner from '../components/ContractAssigner';
import { formatDate } from '../utils/helpers';

import {
  useCreateContract,
  useUpdateContract,
  useUpdateContractStatus
} from '../api/contract.api';


import { ContractDataType, ContractUpdateType, ContractType } from '../type/contract.type'
import useFetch from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';


const Contracts: React.FC = () => {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const { data: contracts, loading, refetch } = useFetch<ContractDataType[]>("/contracts/get-create-recipient");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignerOpen, setisAssignerOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractDataType | null>(null);



  const { mutate: createMutate, isLoading: isCreating } = useCreateContract();
  const { mutate: updateMutate, isLoading: isUpdating } = useUpdateContract();
  const { mutate: mutateStatus, isLoading: isUpdatingStatus } = useUpdateContractStatus();


  const { user } = useAuth();
  const handleContractUpload = async (contract: ContractType) => {
    try {
      await createMutate(contract);
      refetch();
      setIsUploaderOpen(false);
    } catch (err) {
      console.error("Lỗi tạo hợp đồng (từ component):", err);
    }
  };

  const handleSaveEdit = async (contract: ContractUpdateType) => {
    try {
      await updateMutate(contract);
      refetch();
      setIsEditOpen(false);
    } catch (err) {
      console.error("Lỗi cập nhật hợp đồng (từ component):", err);
    }
  };


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
    cell: (contract: ContractDataType) => {
      const isOwner = user?.email === contract.createdBy?.email;
      return (
        <select
          className={`rounded-md border px-2 py-1 text-sm text-gray-700 ${isOwner
            ? 'border-gray-300 bg-white focus:border-indigo-500 focus:outline-none'
            : 'border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500'
            }`}
          value={contract.status}
          onChange={async (e) => {
            if (!isOwner) return;
            try {
              await mutateStatus({
                id: contract.id,
                status: e.target.value as "draft" | "pending" | "signed" | "cancelled",
              });
              refetch();
            } catch (err) {
              console.error(err);
            }
          }}
          disabled={isUpdatingStatus || !isOwner}

        >
          <option value="draft">Bản nháp</option>
          <option value="pending">Chờ ký</option>
          <option value="signed">Đã ký</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      );
    },
    sortable: true,
  }
    ,
  {
    id: 'creator',
    header: 'Người tạo',
    cell: (contract: ContractDataType) => <div className="text-sm text-gray-500">{contract.createdBy.name}</div>,
    sortable: true
  },
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
    cell: (contract: ContractDataType) => (
      <div className="flex space-x-2">
        <Link
          to={`/contracts/${contract.id}`}
          className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
        >
          <FileText className="mr-1 h-3 w-3" />
          Chi tiết
        </Link>
        {user?.email === contract.createdBy.email && (
          <>
            <button
              className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100"
              onClick={() => {
                setIsEditOpen(true);
                setSelectedContract(contract);
              }}
            >
              Cập nhật
            </button>

            <button
              className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
              onClick={() => {
                setisAssignerOpen(true);
                setSelectedContract(contract);
              }}
            >
              <User className="mr-1 h-3 w-3" />
              Gán
            </button>
          </>
        )}
      </div>
    ),
  }
  ];
  if (loading) {
    return <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>;
  }
  return <div>
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý hợp đồng</h1>
      <button
        onClick={() => setIsUploaderOpen(true)}
        disabled={isCreating} // Biến này giờ đã được định nghĩa
        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm
        ${isCreating ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
      >
        <Plus className="mr-2 h-5 w-5" />
        {isCreating ? "Đang tạo..." : "Tạo hợp đồng mới"}
      </button>

    </div>
    <div className="rounded-lg bg-white shadow">
      <div className="p-6">
        <DataTable columns={columns} data={contracts || []} pagination={true} searchable={true} itemsPerPage={10} />
      </div>
    </div>
    <ContractUploader
      isOpen={isUploaderOpen}
      onClose={() => setIsUploaderOpen(false)}
      onUpload={handleContractUpload}
      isCreating={isCreating}
    />
    <ContractEditor
      isOpen={isEditOpen}
      contract={selectedContract}
      onClose={() => setIsEditOpen(false)}
      onSave={handleSaveEdit}
    />

    <ContractAssigner
      isOpen={isAssignerOpen}
      contract={selectedContract}
      onClose={() => setisAssignerOpen(false)}
      onAssignSuccess={refetch}
    />

  </div>;
};
export default Contracts;