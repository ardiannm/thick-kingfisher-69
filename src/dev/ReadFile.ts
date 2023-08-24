import { readFileSync } from "fs";

const ReadFile = () => {
  return readFileSync("./src/tests/tests.txt", "utf-8");
};

export default ReadFile;
