import { AssignerType } from "./assigner.type";
import { UserData } from "./auth.type";
import { SignatureType } from "./signature.type";

export interface ContractType {
    name: string;
    description: string;
    file: File;
}
export interface ContractDataType {
  id: number;
  title: string;
  description: string;
  file_url: string;
  fileType: string;
  fileSize: string; 
  hash: string;
  status: string;
  createdBy: {
    id: number,
    name: string,
    email: string,
  };
  recipientLinks: AssignerType[],
  signatures: SignatureType[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractUpdateType {
    id: number;
    title: string;
    description: string;
    file: File | null;
}