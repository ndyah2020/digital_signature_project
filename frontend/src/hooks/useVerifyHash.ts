import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export type VerificationStatus = 'idle' | 'pending' | 'verified' | 'mismatch' | 'error';
export function useVerifyContractApi(url: string | null | undefined) {
  
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    
    if (!url || url.includes('undefined')) {
      setStatus('idle'); 
      setErrorMessage(null);
      return; 
    }
    const verifyContract = async () => {
      setStatus('pending');
      setErrorMessage(null);
      try {
        console.log("Calling API with valid URL:", url);
        const response = await api.get(url);

        const apiStatus = response.data?.data?.status;
        if (apiStatus === 'verified' || apiStatus === 'mismatch') {
          setStatus(apiStatus);
        } else {
          setStatus('error');
          setErrorMessage('Phản hồi từ máy chủ không hợp lệ.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || err.message || 'Lỗi không xác định khi xác thực'
        );
      }
    };
    
    verifyContract();

  }, [url]); 

  return { status, errorMessage };
}