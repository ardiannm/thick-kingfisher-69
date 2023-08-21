const Write = (obj: unknown, path = "./dev/parser.json") => {
  const str = JSON.stringify(obj, null, 2);
  Deno.writeTextFile(path, str);
  return str;
};

export default Write;
