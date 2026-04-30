export interface SignatureType {
  id: number,
  signatureHash: string,
  isValid: boolean,
  signedAt: Date,
  signatureAlgo: string
  user: {
    id: number,
    name: string,
    email: string,
    publicKey: string,
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
