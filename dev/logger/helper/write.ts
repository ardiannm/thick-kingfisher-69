const Write = (obj: unknown, path: string) => {
  const str = JSON.stringify(obj);
  Deno.writeTextFile(path, str);
  return str;
};

export default Write;
