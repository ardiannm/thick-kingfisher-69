import { readFileSync } from "fs";

const ReadFile = () => {
  return readFileSync("./src/tests/test.txt", "utf-8");
};

export default ReadFile;
