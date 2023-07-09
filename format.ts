export const format = (string: string) =>
  string
    .replace(/([A-Z\s])/g, "-$1")
    .toLowerCase()
    .trim();
