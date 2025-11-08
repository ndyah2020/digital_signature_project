import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Edit, Eye, Loader2, ShieldCheck, ShieldAlert, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { formatDate } from '../utils/helpers';
import SignatureDialog from '../components/SignatureDialog';
import { ContractDataType } from '../type/contract.type'
import useFetch from '../hooks/useFetch'
import { useVerifyContractApi, VerificationStatus } from '../hooks/useVerifyHash';
import { useViewContract } from '../api/contract.api';
import { useCheckSigner } from '../api/singnature.api';
import { useAuth } from '../hooks/useAuth';
import { SignatureType } from '../type/signature';
import { RecipientType } from '../type/recipient.type';


const VerificationStatusBadge: React.FC<{ status: VerificationStatus; errorMessage: string | null }> = ({ status, errorMessage }) => {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
        <Clock className="mr-1 h-3 w-3 animate-spin" />
        Đang xác thực tính toàn vẹn...
      </span>
    );
  }
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        Đã xác thực: File toàn vẹn
      </span>
    );
  }
  if (status === 'mismatch') {
    return (
      <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
        <XCircle className="mr-1 h-3 w-3" />
        CẢNH BÁO: File này không khớp với bản gốc!
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
        <XCircle className="mr-1 h-3 w-3" />
        Lỗi xác thực: {errorMessage}
      </span>
    );
  }
  return null;
};

const ContractDetail: React.FC = () => {
  const [expandedSignatureId, setExpandedSignatureId] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const { toast } = useToast();

const { data: contract, loading, error, refetch: refetchContract } = useFetch<ContractDataType>(`/contracts/${id}`);

const { status: verificationStatus, errorMessage: verificationError } = useVerifyContractApi(
  contract?.id ? `/contracts/verify_contracts/${contract.id}` : null
);

const { data: recipient, refetch: refetchRecipient } = useFetch<RecipientType[]>(
  contract?.id ? `/recipients/contract/${contract.id}/get-recipient` : ""
);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const { mutate: viewContract, isLoading } = useViewContract();
  const { mutateAsync: checkSigner } = useCheckSigner();
  const { user } = useAuth();

  if (loading) {
    return <div className="flex h-full items-center justify-center p-10">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
    </div>;
  }

  if (error || !contract) {
    return <div className="flex h-full flex-col items-center justify-center p-10">
      <h1 className="text-2xl font-bold text-gray-900">
        {error ? "Lỗi tải hợp đồng" : "Không tìm thấy hợp đồng"}
      </h1>
      <p className="mt-2 text-gray-600">
        {error ? (error.message || "Đã xảy ra lỗi.") : "Hợp đồng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
      </p>
      <Link to="/contracts" className="mt-4 text-indigo-600 hover:text-indigo-500">
        Quay lại danh sách hợp đồng
      </Link>
    </div>;
  }

  const handleViewFile = async () => {
    try {
      const blob = await viewContract(contract.id);
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      setShowViewer(true);
    } catch (err) {
      console.error("Không thể xem hợp đồng:", err);
      toast({
        title: "Lỗi xem hợp đồng",
        description: "Không thể xem hợp đồng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = async () => {
    try {
      const blob = await viewContract(contract.id);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${contract.title || "hop_dong"}.pdf`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Không thể tải hợp đồng:", err);
      toast({
        title: "Lỗi tải file",
        description: "Không thể tải file hợp đồng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleCheck = async () => {
    const userId = user?.sub;
    const userName = user?.email;
    if (!userId || !userName) return;

    const contractId = contract.id;
    const contractName = contract.title;
    try {
      const isValid = await checkSigner({ contractId, contractName });
      if (isValid) {
        setIsSignatureDialogOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi xác thực người ký:", error);
    }
  };

  const handleSignatureSuccess = () => {
    setIsSignatureDialogOpen(false);
    refetchContract();
    refetchRecipient();
  };

  const handleToggleSignature = (id: number) => {
    setExpandedSignatureId(prevId => (prevId === id ? null : id));
  };


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
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
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
              {contract.title}
            </h1>
            <div className="ml-4">{getStatusBadge()}</div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Mã hợp đồng: {contract.id} • Ngày tạo:{' '}
            {formatDate(contract.createdAt)}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadFile}
            disabled={isLoading}
            className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ${isLoading ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50"
              }`}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Đang xử lý..." : "Tải xuống hợp đồng"}
          </button>


          <button
            onClick={() => handleCheck()}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FileText className="mr-2 h-4 w-4" />
            Ký hợp đồng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 space-y-6">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Nội dung hợp đồng
                </h3>
                <VerificationStatusBadge status={verificationStatus} errorMessage={verificationError} />
              </div>
            </div>
            <div className="border-t border-gray-200">
              {!showViewer && (
                <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Nội dung file đang được niêm phong.
                  </p>
                  <button
                    disabled={!verificationStatus || isLoading}
                    onClick={handleViewFile}
                    className={`mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${!verificationStatus || isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
                      }`}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {isLoading ? "Đang tải..." : "Xem nội dung file"}
                  </button>
                  <p className="mt-3 text-xs text-gray-400">
                    Hệ thống sẽ xác thực tính toàn vẹn của file trước khi hiển thị.
                  </p>
                </div>
              )}

              {showViewer && fileUrl && (
                <iframe
                  src={fileUrl}
                  title={`Nội dung file ${contract.title}`}
                  className="w-full h-[800px]"
                  style={{ border: "none" }}
                  allow="fullscreen"
                >
                  Trình duyệt của bạn không hỗ trợ iframe.
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    Nhấn vào đây để xem file.
                  </a>
                </iframe>
              )}
            </div>
          </div>
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
                    {contract.title}
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
                    {contract.createdBy.name}
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
                    {contract.fileType?.includes('pdf') ?
                      <FileText className="mr-1 h-4 w-4 text-red-500" /> :
                      <FileText className="mr-1 h-4 w-4 text-blue-500" />
                    }
                    {contract.fileType?.toUpperCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Kích thước
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {(Number(contract.fileSize) / 1024 / 1024).toFixed(2)} MB
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contract.description || 'Không có mô tả'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>


          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Các bên tham gia
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {recipient && recipient.length > 0 ? (

                <ul className="divide-y divide-gray-200">
                  {recipient.map((item) => (
  
                    <li
                      key={item.userId} 
                      className="border-b border-gray-200 px-4 py-4 last:border-b-0 sm:px-6"
                    >
                      <div className="flex items-center justify-between">
                        {/* Thông tin người được gán */}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.user.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.user.email}
                          </p>
                        </div>
          
                        <div className="text-right">
                          {item.sign_status === "signed" ? (
                            <>
                              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Đã ký
                              </span>                 
                              {item.signed_at && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Ký lúc:{" "}
                                  {new Date(item.signed_at).toLocaleString("vi-VN")}
                                </p>
                              )}
                            </>
                          ) : item.isExpired ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-xs font-medium text-red-800">
                              Hết hạn
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-medium text-yellow-800">
                                <Clock className="mr-1 h-3 w-3" />
                                Chờ ký
                              </span>
                              {item.deadline && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Hạn ký:{" "}
                                  {new Date(item.deadline).toLocaleDateString("vi-VN")}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                // Nếu mảng rỗng
                <div className="px-4 py-5 text-center text-sm text-gray-500 sm:px-6">
                  Chưa có bên nào tham gia hợp đồng này.
                </div>
              )}
            </div>
            <div className="col-span-1 space-y-6">
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Lịch sử chữ ký (Đã xác minh)
                  </h3>
                </div>

                <div className="border-t border-gray-200">                
                  {contract.signatures && contract.signatures.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {contract.signatures.map((signature: SignatureType) => (
                        <li key={signature.id} className="px-4 py-4 sm:px-6">
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {signature.user.name}
                              </p>
                              {signature.isValid ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                  <ShieldCheck className="mr-1 h-3 w-3" />
                                  Hợp lệ
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                  <ShieldAlert className="mr-1 h-3 w-3" />
                                  Không hợp lệ
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDate(signature.signedAt)}
                            </p>

                            <div className="mt-2">
                              <button
                                onClick={() => handleToggleSignature(signature.id)}
                                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                {expandedSignatureId === signature.id ? 'Ẩn chi tiết' : 'Xem chi tiết kỹ thuật'}
                                {expandedSignatureId === signature.id ?
                                  <ChevronUp className="ml-1 h-3 w-3" /> :
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                }
                              </button>

                              {/* Thông tin kỹ thuật (chỉ hiển thị khi bấm) */}
                              {expandedSignatureId === signature.id && (
                                <div className="mt-2 space-y-2 rounded bg-gray-50 p-3">
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Thuật toán:</p>
                                    <p className="text-xs font-mono text-gray-900">
                                      {signature.signatureAlgo || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-500">Giá trị chữ ký (Base64):</p>
                                    <p className="break-all text-xs font-mono text-gray-900">
                                      {signature.signatureHash}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-6 text-center sm:px-6">
                      <FileText className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Chưa có chữ ký nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
      <SignatureDialog
        isOpen={isSignatureDialogOpen}
        onSuccess={handleSignatureSuccess}
        onClose={() => setIsSignatureDialogOpen(false)}
        contractId={contract.id}
      />
    </div>
  );
};
export default ContractDetail;
