import { api } from "../utils/api";
import { ContractType, ContractDataType, ContractUpdateType } from "../type/contract.type";
export const createContract = async (payload: ContractType) => {
  const formData = new FormData();
  formData.append("title", payload.name);
  formData.append("description", payload.description);

  if (payload.file instanceof File) {
    formData.append("file", payload.file);
  } else {
    throw new Error("Tệp không hợp lệ. Hãy chọn lại file hợp đồng!");
  }

  const entries = Array.from(formData.entries());
console.log(Object.fromEntries(entries));

  const res = await api.post("/contracts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};


export const updateContractStatus = async ({
  id,
  status,
}: {
  id: number;
  status: string;
}) => {
  const res = await api.patch(`/contracts/${id}/status`, { status });
  return res.data.data; 
};






// chưa có api để test
export const updateContract = async (payload: ContractUpdateType): Promise<ContractDataType> => {
  const { id, title, description, file } = payload;

  const formData = new FormData();
  if (title) formData.append("title", title);
  if (description) formData.append("description", description);
  if (status) formData.append("status", status);
  if (file) {
    if (file instanceof File) {
      formData.append("file", file);
    } else {
      throw new Error("Tệp không hợp lệ. Hãy chọn lại file hợp đồng!");
    }
  }

  const res = await api.put(`/contracts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};