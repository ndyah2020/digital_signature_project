export interface SignatureType {
  id: number,
  signatureHash: string,
  isValid: boolean,
  signedAt: Date,
  user: {
    id: number,
    name: string,
    email: string,
  },
}

export interface SignPayload {
  contractId: number;
  password: string;
  // totpToken?: string;
  // emailOtp?: string;
}

export interface SignResponse {
  message: string;
  signatureId?: number;
  isValid?: boolean;
}
