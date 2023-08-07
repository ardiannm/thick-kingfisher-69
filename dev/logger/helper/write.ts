const Write = (obj: unknown, path: string) => {
  Deno.writeTextFile(path, JSON.stringify(obj, null, 3));
};

export default Write;
