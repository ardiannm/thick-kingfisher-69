export const loggerLog = <T>(text: T, directory = "dev/main.json"): void => {
  const bytes = new TextEncoder().encode(JSON.stringify(text, null, 2));
  Deno.writeFileSync(directory, bytes);
};
