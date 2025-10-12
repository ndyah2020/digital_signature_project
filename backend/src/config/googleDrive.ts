import { google } from "googleapis";
import * as path from "path";
import * as fs from "fs";

const KEYFILE_PATH = path.join(__dirname, "../../credentials.json");
const credentials = JSON.parse(fs.readFileSync(KEYFILE_PATH, "utf8"));

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

export const drive = google.drive({
  version: "v3",
  auth,
});