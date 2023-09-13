import TestService from "./src/services/tests/TestService";

const service = new TestService();
const res = service.loadDirectoryFiles("bin").run();

res.forEach((res) => {
  console.log(res.result);
});
