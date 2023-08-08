const Read = (path: string) => {
  return Deno.readTextFile(path);
};

export default Read;
