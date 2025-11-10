
export interface ContractsStats {
    total: number;
    pending: number;
    signed: number;
    cancelled: number;
    draft: number;
};

export interface UserStas {
    total: number;
    admin: number;
    signer: number; 
    viewer: number;
}

export interface DashboardStats {
  contractsStats: ContractsStats
  usersStats: UserStas
}
