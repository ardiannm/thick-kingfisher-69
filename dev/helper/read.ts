const Read = (path = "./dev/language.bank") => {
  return Deno.readTextFile(path);
};

export default Read;
