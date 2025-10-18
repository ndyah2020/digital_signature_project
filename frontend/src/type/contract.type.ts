export interface ContractType {
    name: string;
    description: string;
    file: File;
}

export interface ContractDataType {
    id: number,
    title: string,
    description: string,
    file_url: string,
    fileType: string,
    fileSize: string,
    hash: string,
    status: string,
    createdAt: Date,
    updatedAt: Date
}

export interface ContractUpdateType {
    id: number;
    title: string;
    description: string;
    file: File | null;
}