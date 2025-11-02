import { useToast } from "../components/ui/use-toast";
import { useMutation } from "../hooks/useMutation";
import { SignPayload, SignResponse } from "../type/signature";
import { api } from "../utils/api";

interface CheckSignerVars {
  userId: number;
  contractId: number;
}
const checkSigner = async (data: CheckSignerVars) : Promise<boolean> => {
  const contractId = data.contractId;
  const res = await api.post("/signatures/check-signer", { contractId });
  console.log(res)
  return res.data;
} 

const signContract = async (payload: SignPayload): Promise<SignResponse> => {
  const res = await api.post("/signature/sign", payload);
  return res.data;
};

export const useSignature = () => {

  return useMutation<SignResponse, SignPayload>(
    signContract,
    {
      onSuccess: (data, variables) => {
        console.log(
          `✅ Ký hợp đồng ID: ${variables.contractId} thành công (${data.message})`
        );
      },
      onError: (error, variables) => {
        console.error(
          `Lỗi khi ký hợp đồng ID: ${variables?.contractId || "?"}:`,
          error.message
        );
      },
    }
  );
};

export const useCheckSigner = () => {
  const { toast } = useToast();

  return useMutation<boolean, CheckSignerVars>(checkSigner, {
    onSuccess: (data, variables) => {
      if (data) {
        toast({
          title: "Xác thực thành công",
          description: `Người dùng ${variables.userId} hợp lệ cho hợp đồng #${variables.contractId}.`,
        });
      } else {
        toast({
          title: "Xác thực thất bại",
          description: "Người dùng không có quyền ký hợp đồng này.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error(  
        error.message
      );
      toast({
        title: "Lỗi kiểm tra quyền ký",
        description: "Không thể xác thực người dùng. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    },
  });
};