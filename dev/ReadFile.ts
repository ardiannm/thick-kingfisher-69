import { readFileSync } from "fs";

const ReadFile = () => {
  return readFileSync("./dev/tests/tests.txt", "utf-8");
};

export default ReadFile;
