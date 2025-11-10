import { useToast } from "../components/ui/use-toast";
import { useMutation } from "../hooks/useMutation";
import { SignatureType, SignPayload, SignResponse } from "../type/signature.type";
import { api } from "../utils/api";

interface CheckSignerVars {
  contractId: number;
  contractName: string;
}
const checkSigner = async (data: CheckSignerVars) : Promise<boolean> => {
  const contractId = data.contractId;
  const res = await api.post("/signatures/check-signer", { contractId });
  return res.data;
} 

const signContract = async (payload: SignPayload): Promise<SignResponse> => {
  const res = await api.post("/signatures/sign", payload);
  return res.data;
};

interface VerifySignature {
  signatures: SignatureType[],
  url_contract: string,
}

interface ResponseApi {
  message: string,
  access: boolean
}
const verifySignatures = async(data: VerifySignature) : Promise<ResponseApi> => {
  const res = await api.post('/signatures/verify', data)
  return res.data
}

export const useSignature = () => {
  const { toast } = useToast();
  return useMutation<SignResponse, SignPayload>(
    signContract,
    {
      onSuccess: (data, variables) => {
        console.log(
          `Ký hợp đồng ID: ${variables.contractId} thành công (${data.message})`
        );
        toast({
          title: "Ký hợp đồng",
          description: `Ký hợp đồng ID: ${variables.contractId} thành công`,
        });
      },
      onError: (error, variables) => {
        console.error(
          `Lỗi khi ký hợp đồng ID: ${variables?.contractId || "?"}:`,
          error.message
        );
        
        toast({
          title: "Ký hợp đồng",
          description: `Lỗi khi ký hợp đồng ID: ${variables?.contractId || error.message}`,
          variant: "destructive",
        });
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
          description: `Bạn hợp lệ cho hợp đồng #${variables.contractName}.`,
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

export const useVerifySignatures = () => {
  const { toast } = useToast();
  return useMutation<ResponseApi, VerifySignature>(verifySignatures, {
    onSuccess: (data) => {
      console.log(data.message)
      toast({
          title: "Xác thực thành công",
          description: !data.message || `Các chữ ký hợp lệ.`
      });
    },
    onError:(error) => {
      console.error(error.message)
      toast({
          title: "Xác thực thất bại",
          description: !error.message ||"Có một chữ ký không hợp lệ.",
      });
    }
  })
}