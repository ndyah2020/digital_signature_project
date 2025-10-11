import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Clock, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/use-toast';
import { formatDate } from '../utils/helpers';
import SignatureDialog from '../components/SignatureDialog';
const ContractDetail: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const {
    user,
    hasPermission
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        // In a real app, this would be a real API call
        // const response = await api.get(`/contracts/${id}`)
        // setContract(response.data)
        // Mocking data for demonstration
        setContract({
          id,
          name: 'Hợp đồng mua bán hàng hóa',
          description: 'Hợp đồng mua bán hàng hóa giữa công ty A và công ty B',
          status: 'pending',
          creator: 'Nguyễn Văn A',
          createdAt: '2023-06-10T10:30:00Z',
          updatedAt: '2023-06-10T10:30:00Z',
          hash: '8a9d8f7e6c5b4a3',
          fileType: 'pdf',
          fileSize: 1024000,
          signatures: [{
            id: 'sig1',
            userId: 'user1',
            userName: 'Nguyễn Văn A',
            role: 'Giám đốc',
            timestamp: '2023-06-10T11:30:00Z',
            signature: 'a1b2c3d4e5f6g7h8i9j0',
            isValid: true
          }],
          parties: [{
            id: 'party1',
            name: 'Công ty A',
            representative: 'Nguyễn Văn A',
            role: 'Giám đốc'
          }, {
            id: 'party2',
            name: 'Công ty B',
            representative: 'Trần Thị B',
            role: 'Giám đốc'
          }]
        });
      } catch (error) {
        console.error('Error fetching contract details:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải thông tin hợp đồng. Vui lòng thử lại sau.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchContractDetails();
    }
  }, [id, toast]);
  const handleSignContract = async (signature: string) => {
    try {
      // In a real app, this would be a real API call
      // await api.post(`/contracts/${id}/sign`, { signature })
      // Update contract state with new signature
      setContract({
        ...contract,
        signatures: [...contract.signatures, {
          id: `sig${contract.signatures.length + 1}`,
          userId: user?.id,
          userName: user?.name,
          role: 'Người ký',
          timestamp: new Date().toISOString(),
          signature,
          isValid: true
        }],
        status: contract.signatures.length + 1 >= contract.parties.length ? 'signed' : 'pending'
      });
      toast({
        title: 'Thành công',
        description: 'Hợp đồng đã được ký thành công.'
      });
    } catch (error) {
      console.error('Error signing contract:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể ký hợp đồng. Vui lòng thử lại sau.',
        variant: 'destructive'
      });
    }
  };
  if (loading) {
    return <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>;
  }
  if (!contract) {
    return <div className="flex h-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Không tìm thấy hợp đồng
        </h1>
        <p className="mt-2 text-gray-600">
          Hợp đồng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link to="/contracts" className="mt-4 text-indigo-600 hover:text-indigo-500">
          Quay lại danh sách hợp đồng
        </Link>
      </div>;
  }
  const getStatusBadge = () => {
    switch (contract.status) {
      case 'draft':
        return <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
            Bản nháp
          </span>;
      case 'pending':
        return <span className="inline-flex rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            Chờ ký
          </span>;
      case 'signed':
        return <span className="inline-flex rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Đã ký
          </span>;
      case 'cancelled':
        return <span className="inline-flex rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            Đã hủy
          </span>;
      default:
        return null;
    }
  };
  const getStatusIcon = () => {
    switch (contract.status) {
      case 'draft':
        return <Edit className="h-5 w-5 text-gray-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'signed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  const canSign = hasPermission('sign_contract') && contract.status === 'pending';
  return <div>
      <div className="mb-6">
        <Link to="/contracts" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Quay lại danh sách hợp đồng
        </Link>
      </div>
      <div className="mb-6 flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {contract.name}
            </h1>
            <div className="ml-4">{getStatusBadge()}</div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Mã hợp đồng: {contract.id} • Ngày tạo:{' '}
            {formatDate(contract.createdAt)}
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </button>
          {canSign && <button onClick={() => setIsSignatureDialogOpen(true)} className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <FileText className="mr-2 h-4 w-4" />
              Ký hợp đồng
            </button>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contract Info */}
        <div className="col-span-2 space-y-6">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Thông tin hợp đồng
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Tên hợp đồng
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contract.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Trạng thái
                  </dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900">
                    {getStatusIcon()}
                    <span className="ml-2">
                      {contract.status === 'draft' && 'Bản nháp'}
                      {contract.status === 'pending' && 'Chờ ký'}
                      {contract.status === 'signed' && 'Đã ký'}
                      {contract.status === 'cancelled' && 'Đã hủy'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Người tạo
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contract.creator}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Ngày tạo
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(contract.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Loại file
                  </dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900">
                    {contract.fileType === 'pdf' ? <div className="mr-1 h-4 w-4 text-red-500" /> : <FileText className="mr-1 h-4 w-4 text-blue-500" />}
                    {contract.fileType.toUpperCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Kích thước
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {(contract.fileSize / 1024 / 1024).toFixed(2)} MB
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contract.description || 'Không có mô tả'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Hash (SHA-256)
                  </dt>
                  <dd className="mt-1 break-all rounded bg-gray-50 p-2 text-xs font-mono text-gray-900">
                    {contract.hash}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          {/* Parties */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Các bên tham gia
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul>
                {contract.parties.map((party: any) => <li key={party.id} className="border-b border-gray-200 px-4 py-4 last:border-b-0 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {party.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {party.representative} • {party.role}
                        </p>
                      </div>
                      {contract.signatures.some((sig: any) => sig.userId === party.id) ? <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Đã ký
                        </span> : <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-medium text-yellow-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Chờ ký
                        </span>}
                    </div>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>
        {/* Signatures */}
        <div className="col-span-1">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Chữ ký số
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {contract.signatures.length > 0 ? <ul className="divide-y divide-gray-200">
                  {contract.signatures.map((signature: any) => <li key={signature.id} className="px-4 py-4 sm:px-6">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {signature.userName}
                          </p>
                          {signature.isValid ? <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Hợp lệ
                            </span> : <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                              <XCircle className="mr-1 h-3 w-3" />
                              Không hợp lệ
                            </span>}
                        </div>
                        <p className="text-xs text-gray-500">
                          {signature.role}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(signature.timestamp)}
                        </p>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500">
                            Chữ ký:
                          </p>
                          <p className="break-all rounded bg-gray-50 p-1 text-xs font-mono text-gray-900">
                            {signature.signature}
                          </p>
                        </div>
                      </div>
                    </li>)}
                </ul> : <div className="flex flex-col items-center justify-center py-6">
                  <FileText className="mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Chưa có chữ ký nào</p>
                  {canSign && <button onClick={() => setIsSignatureDialogOpen(true)} className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Ký hợp đồng ngay
                    </button>}
                </div>}
            </div>
          </div>
        </div>
      </div>
      <SignatureDialog isOpen={isSignatureDialogOpen} onClose={() => setIsSignatureDialogOpen(false)} onSign={handleSignContract} contractHash={contract.hash} />
    </div>;
};
export default ContractDetail;