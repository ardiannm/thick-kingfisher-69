export const format = (string: string) =>
  string
    .replace(/([A-Z])/g, "-$1")
    .replace(/^-/g, "")
    .toLowerCase()
    .trim();
