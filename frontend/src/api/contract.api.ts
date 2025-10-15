import { api } from "../utils/api";
import { ContractType } from "../type/contract.type";

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
