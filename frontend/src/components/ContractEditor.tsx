import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { ContractDataType, ContractUpdateType } from "../type/contract.type";

interface ContractEditorProps {
  isOpen: boolean;
  contract: ContractDataType | null;
  onClose: () => void;
  onSave: (updated: ContractUpdateType) => void;
}

const ContractEditor: React.FC<ContractEditorProps> = ({
  isOpen,
  contract,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (contract) {
      setTitle(contract.title);
      setDescription(contract.description || "");
      setStatus(contract.status || "draft");
    }
  }, [contract]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    onSave({
      id: contract.id,
      title,
      description,
      // status,
      file,
    });
    toast({
      title: "Đang cập nhật hợp đồng...",
      description: "Vui lòng chờ trong giây lát.",
    });
  };

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="mb-4 text-xl font-bold text-gray-800">Cập nhật hợp đồng</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên hợp đồng
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="draft">Bản nháp</option>
              <option value="signed">Đã ký</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tệp đính kèm mới (nếu có)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractEditor;
