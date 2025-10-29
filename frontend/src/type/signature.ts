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
