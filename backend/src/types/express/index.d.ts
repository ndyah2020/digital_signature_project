import { Multer } from "multer";
import { User } from "src/entities/User";

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: Multer.File[];
      user?: User | any;
    }
  }
}
