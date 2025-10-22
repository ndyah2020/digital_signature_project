import { useState, useEffect } from 'react';

async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  const hexHash = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
    
  return hexHash;
}


export type VerificationStatus = 'pending' | 'verified' | 'mismatch' | 'error';

export function useVerifyHash(fileUrl?: string, expectedHash?: string) {
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {

    setStatus('pending');
    setErrorMessage(null);

    if (!fileUrl || !expectedHash) {
      setStatus('pending'); 
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Lỗi tải file: ${response.statusText} (mã ${response.status})`);
        }
        const fileBuffer = await response.arrayBuffer();
        
        const calculatedHash = await sha256(fileBuffer);

        if (calculatedHash === expectedHash) {
          setStatus('verified'); 
        } else {
          setStatus('mismatch');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Lỗi không xác định trong quá trình xác thực');
      }
    };

    verify();
  }, [fileUrl, expectedHash]); 

  return { status, errorMessage };
}