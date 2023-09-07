import { readFileSync } from "fs";

const ReadFile = (path: string) => {
  return readFileSync("dev/tests/" + path, "utf-8");
};

export default ReadFile;
