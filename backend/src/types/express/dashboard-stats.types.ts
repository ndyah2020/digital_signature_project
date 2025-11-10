export interface ContractStats {
    total: number;
    pending: number;
    signed: number;
    cancelled: number;
    draft: number;
}

export interface UserStats {
    total: number;
    admin: number;
    signer: number;
    viewer: number;
}
