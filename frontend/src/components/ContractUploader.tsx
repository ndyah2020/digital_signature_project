import React, { useState, useRef } from 'react';
import { X, Upload, FileText, File } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { calculateFileHash } from '../utils/crypto';
import { formatFileSize } from '../utils/helpers';
interface ContractUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (contractData: any) => void;
}
const ContractUploader: React.FC<ContractUploaderProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const handleFileChange = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Loại file không hỗ trợ',
        description: 'Chỉ chấp nhận file PDF hoặc DOCX.',
        variant: 'destructive'
      });
      return;
    }
    if (file.size > maxSize) {
      toast({
        title: 'File quá lớn',
        description: 'Kích thước file tối đa là 10MB.',
        variant: 'destructive'
      });
      return;
    }
    setIsProcessing(true);
    try {
      // Calculate file hash
      const hash = await calculateFileHash(file);
      setFile(file);
      setFileHash(hash);
      setName(file.name.split('.')[0]); // Set default name from filename
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Lỗi xử lý file',
        description: 'Không thể tính toán hash của file.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng chọn file và nhập tên hợp đồng.',
        variant: 'destructive'
      });
      return;
    }
    onUpload({
      name,
      description,
      file,
      hash: fileHash
    });
  };
  const handleReset = () => {
    setFile(null);
    setName('');
    setDescription('');
    setFileHash('');
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Tải lên hợp đồng mới
          </h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {!file ? <div className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
              {isProcessing ? <div className="flex flex-col items-center">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                  <p className="text-sm text-gray-500">Đang xử lý file...</p>
                </div> : <>
                  <Upload className="mb-2 h-10 w-10 text-gray-400" />
                  <p className="mb-1 text-sm font-medium text-gray-700">
                    Kéo thả file vào đây hoặc click để chọn
                  </p>
                  <p className="text-xs text-gray-500">
                    Chỉ chấp nhận file PDF, DOCX (tối đa 10MB)
                  </p>
                </>}
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileChange(e.target.files[0]);
            }
          }} disabled={isProcessing} />
            </div> : <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center">
                <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                  {file.type.includes('pdf') ? <FileText className="h-5 w-5 text-indigo-600" /> : <File className="h-5 w-5 text-indigo-600" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button type="button" onClick={handleReset} className="ml-4 flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {fileHash && <div className="mt-2 border-t border-gray-200 pt-2">
                  <p className="text-xs font-medium text-gray-700">
                    SHA-256 Hash:
                  </p>
                  <p className="break-all text-xs text-gray-500">{fileHash}</p>
                </div>}
            </div>}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Tên hợp đồng <span className="text-red-500">*</span>
            </label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Hủy
            </button>
            <button type="submit" disabled={!file || !name || isProcessing} className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75">
              Tải lên
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export default ContractUploader;