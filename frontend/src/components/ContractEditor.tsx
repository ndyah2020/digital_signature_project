import React, { useState, useEffect, useRef } from "react";
import { X, Upload, FileText, File as FileIcon } from "lucide-react";
import { ContractDataType, ContractUpdateType } from "../type/contract.type";
import { useToast } from "../components/ui/use-toast";
// Giả định bạn có hàm này trong utils giống như Uploader
import { formatFileSize } from "../utils/helpers"; 

interface ContractEditorProps {
  isOpen: boolean;
  contract: ContractDataType | null;
  onClose: () => void;
  onSave: (updated: ContractUpdateType) => void;
  isSave: boolean;
}

const ContractEditor: React.FC<ContractEditorProps> = ({
  isOpen,
  contract,
  onClose,
  onSave,
  isSave,
}) => {
  // State form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // State UI interaction
  const [isDragging, setIsDragging] = useState(false);
  
  // Hooks
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load dữ liệu khi mở modal
  useEffect(() => {
    if (contract) {
      setTitle(contract.title);
      setDescription(contract.description || "");
      // Reset file khi mở form edit, vì đây là upload file MỚI thay thế file cũ
      setFile(null); 
    }
  }, [contract]);

  // --- Logic xử lý File (Giống hệt Uploader) ---
  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile) return;

    const allowedType = 'application/pdf';
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (selectedFile.type !== allowedType) {
      toast({
        title: 'Loại file không hỗ trợ',
        description: 'Chỉ chấp nhận file PDF.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedFile.size > maxSize) {
      toast({
        title: 'File quá lớn',
        description: 'Kích thước file tối đa là 10MB.',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    
    if (!title.trim()) {
        toast({
            title: "Thiếu thông tin",
            description: "Tên hợp đồng không được để trống",
            variant: "destructive"
        });
        return;
    }
    console.log(contract)
    onSave({
      id: contract.id,
      title,
      description,
      file, 
      createdBy: contract.createdBy.id,
    });
  };

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Cập nhật hợp đồng
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên hợp đồng <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thay đổi tệp đính kèm (Nếu có)
            </label>
            
            {!file ? (
               
                <div 
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mb-2 h-10 w-10 text-gray-400" />
                    <p className="mb-1 text-sm font-medium text-gray-700">
                        Kéo thả file vào đây hoặc click để chọn
                    </p>
                    <p className="text-xs text-gray-500">
                        Chỉ chấp nhận file PDF (tối đa 10MB)
                    </p>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                handleFileChange(e.target.files[0]);
                            }
                        }} 
                    />
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center">
                        <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                            {file.type.includes('pdf') ? (
                                <FileText className="h-5 w-5 text-indigo-600" />
                            ) : (
                                <FileIcon className="h-5 w-5 text-indigo-600" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">
                                {formatFileSize ? formatFileSize(file.size) : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleRemoveFile}
                            className="ml-4 flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Hủy
            </button>
            <button
              disabled={isSave}
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isSave ? ' Đang lưu ...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractEditor;