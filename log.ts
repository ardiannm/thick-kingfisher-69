export const loggerLog = <T>(text: T, directory = "dev/index.json") => {
  const bytes = new TextEncoder().encode(JSON.stringify(text, null, 3));
  Deno.writeFileSync(directory, bytes);
  return text;
};
