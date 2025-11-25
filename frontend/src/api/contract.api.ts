import { api } from "../utils/api";
import { useToast } from "../components/ui/use-toast";
import { ContractDataType, ContractType, ContractUpdateType } from "../type/contract.type";
import { useMutation } from "../hooks/useMutation";
import { AssignPartyVariables } from "../type/assigner.type";


const createContract = async (payload: ContractType): Promise<ContractDataType> => {
  const formData = new FormData();
  formData.append("title", payload.name);
  formData.append("description", payload.description);

  if (payload.file instanceof File) {
    formData.append("file", payload.file);
  } else {
    throw new Error("Tệp không hợp lệ. Hãy chọn lại file hợp đồng!");
  }

  const res = await api.post("/contracts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};


const updateContract = async (payload: ContractUpdateType): Promise<ContractDataType> => {
  const { id, title, description, file } = payload;
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);

  if (file instanceof File) {
    formData.append("file", file);
  }

  const res = await api.put(`/contracts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};


type StatusUpdatePayload = { id: number | string; status: string };
const updateContractStatus = async (payload: StatusUpdatePayload) => {
  const { id, status } = payload;
  const res = await api.patch(`/contracts/${id}/status`, { status });
  return res.data.data; 
};


const viewContract = async (id: number): Promise<Blob> => {
  const res = await api.get(`/contracts/view/${id}`, {
    responseType: "blob",
  });
  return res.data;
};


const assignPartyMutation = async ({ contractId, senderId, recipientItems }: AssignPartyVariables) => {
  const response = await api.post(`/contracts/${contractId}/assign`, {
    senderId,
    recipientItems,
  });
  return response.data;
};
export const useCreateContract = () => {
  const { toast } = useToast();
  return useMutation<ContractDataType, ContractType>(
    createContract,
    {
      onSuccess: () => {
        toast({
          title: "Tạo hợp đồng thành công!",
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
    }
  );
};


export const useUpdateContract = () => {
  const { toast } = useToast();
  return useMutation<ContractDataType, ContractUpdateType>(
    updateContract, 
    {
      onSuccess: () => {
        toast({
          title: "Cập nhật hợp đồng thành công!",
          description: "Thông tin hợp đồng đã được cập nhật.",
        });
      },
      onError: (err) => {
        toast({
          title: "Lỗi cập nhật hợp đồng",
          description: err.message || "Không thể cập nhật hợp đồng.",
          variant: "destructive",
        });
      },
    }
  );
};


export const useUpdateContractStatus = () => {
  const { toast } = useToast();
  return useMutation(
    updateContractStatus,
    {
      onSuccess: (data) => {
        toast({
          title: "✅ Cập nhật trạng thái thành công!",
          description: `Hợp đồng đã chuyển sang trạng thái "${data.status}".`, 
        });
      },
      onError: (err) => {
        toast({
          title: "Lỗi cập nhật trạng thái",
          description: err.message || "Không thể thay đổi trạng thái hợp đồng.",
          variant: "destructive",
        });
      },
    }
  );
};


export const useViewContract = () => {
  return useMutation<Blob, number>(
    viewContract,
    {
      onSuccess: ( id) => {
        console.log(`Tải blob thành công cho ID: ${id}`);
      },
      onError: (error) => {
        console.error("Không thể xem hợp đồng:", error.message);
      },
    }
  );
};

export const useAddRecipient = () => {
  const { toast } = useToast();

  return useMutation(assignPartyMutation, {
    onSuccess: (_, variables) => {
      toast({
        title: 'Đã thêm người dùng vào hợp đồng',
        description: `Đã thêm ${variables.recipientItems.length} người dùng vào hợp đồng #${variables.contractId}.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Lỗi khi gán',
        description: err.response?.data?.message || err.message || 'Không thể gán người dùng.',
        variant: 'destructive',
      });
    },
  });
};

