import { useToast } from "../components/ui/use-toast";
import { useMutation } from "../hooks/useMutation";
import { api } from "../utils/api";

interface EmailResponts {success: boolean, message: string,}
const sendEmailOtp = async (): Promise<EmailResponts> => {
    const res = await api.post("/2fa/request-email-otp");
    return res.data.message;
};
const verifyEmailOtp = async (code: number): Promise<string> => {
    const res = await api.post("/2fa/verify-email-otp", code);
    return res.data;
}


export const useSendEmailOtp = () => {
    const { toast } = useToast();

    return useMutation<EmailResponts>(sendEmailOtp, {
        onSuccess: (data) => {
            console.log("Đã gửi mã OTP:", data);
            toast({
                title: "Gửi mã OTP thành công",
                description: data.message || "Mã OTP đã được gửi đến email của bạn.",
            });
        },
        onError: (error: any) => {
            console.error(" Lỗi khi gửi mã OTP:", error.message);
            toast({
                title: "Lỗi gửi mã OTP",
                description:
                    error?.response?.data?.message ||
                    "Không thể gửi mã OTP. Vui lòng thử lại sau.",
                variant: "destructive",
            });
        },
    });
};

export const useVerifyEmailOtp = () => {
    const { toast } = useToast();
    return useMutation<string, number>(
        verifyEmailOtp,
        {
            onSuccess: (data) => {
                console.log(
                    `Đã gửi mã OTP`
                );
                toast({
                    title: `${data}`,
                    description: "Xác thực otp thành công",
                });
            },
            onError: (error) => {
                console.error(
                    `Lỗi khi gửi mã otp`,
                    error.message
                );
                toast({
                    title: "Lỗi xác thực OTP",
                    description: "Lỗi xác thực OTP",
                });
            },
        }
    );
};