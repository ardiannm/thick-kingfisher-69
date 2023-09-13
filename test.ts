import TestService from "./src/services/tests/TestService";

const res = new TestService().loadDirectoryFiles("bin").run();

res.forEach((res) => {
  const str = `${res.sourceCode}\n${res.result}` + "\n--------------------------------------------------------\n";
  console.log(str);
});
