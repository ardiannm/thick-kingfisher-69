import { html as prettify } from "https://cdn.skypack.dev/js-beautify";

export const loggerLog = (text: string, directory = "__tests__/index.html") => {
  const io = prettify(text, { indent_size: 2, indent_with_tabs: false });
  Deno.writeFileSync(directory, new TextEncoder().encode(io));
  console.log(io);
};
