import { google } from "googleapis";
import path from "path";

const KEYFILE_PATH = path.join(__dirname, "../../credentials.json"); // file service account
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export const drive = google.drive({
  version: "v3",
  auth: new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: SCOPES,
  }),
});
