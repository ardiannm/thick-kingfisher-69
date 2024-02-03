export class Services {
  static ColumnIndexToLetter(column: number): string {
    let name = "";
    while (column > 0) {
      const remainder = (column - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      column = Math.floor((column - 1) / 26);
    }
    return name;
  }

  static ParseName(row: number, column: number) {
    return this.ColumnIndexToLetter(column) + row;
  }
}
