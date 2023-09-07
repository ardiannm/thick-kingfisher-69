import { readFileSync } from "fs";

const ReadFile = (path: string) => {
  return readFileSync(path, "utf-8");
};

export default ReadFile;
