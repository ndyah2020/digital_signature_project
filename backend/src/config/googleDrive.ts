import { google } from "googleapis";
const path = require("path");
const fs = require("fs");

const KEYFILE_PATH = path.join(__dirname, "../../credentials.json");

let credentials: any;
if (fs.existsSync(KEYFILE_PATH)) {
  credentials = JSON.parse(fs.readFileSync(KEYFILE_PATH, "utf8"));
} else {
  console.warn("Warning: credentials.json not found — Google Drive disabled.");
}

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = credentials
  ? new google.auth.GoogleAuth({ credentials, scopes: SCOPES })
  : undefined;

export const drive = credentials ? google.drive({ version: "v3", auth }) : null;
