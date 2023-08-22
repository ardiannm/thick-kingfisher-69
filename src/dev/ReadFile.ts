import { readFileSync } from "fs";

const ReadFile = () => {
  return readFileSync("./src/tst/tst.txt", "utf-8");
};

export default ReadFile;
