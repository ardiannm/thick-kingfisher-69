import { readFileSync } from "fs";

const ImportFile = (path: string) => {
  return readFileSync(path, "utf-8");
};

export default ImportFile;
