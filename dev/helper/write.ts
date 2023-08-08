const Write = (obj: unknown, path: string) => {
  const str = JSON.stringify(obj, null, 2);
  Deno.writeTextFile(path, str);
  return str;
};

export default Write;
