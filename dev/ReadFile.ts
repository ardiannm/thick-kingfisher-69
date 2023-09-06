import { readFileSync } from "fs";

const ReadFile = () => {
  return readFileSync("./dev/tests/_tests_.am", "utf-8");
};

export default ReadFile;
