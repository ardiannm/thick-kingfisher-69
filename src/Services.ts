export class Services {
  private constructor() {}

  static ColumnIndexToLetter(Column: number): string {
    let Name = "";
    while (Column > 0) {
      const Remainder = (Column - 1) % 26;
      Name = String.fromCharCode(65 + Remainder) + Name;
      Column = Math.floor((Column - 1) / 26);
    }
    return Name;
  }

  static NotationA1(Row: number, Column: number) {
    return this.ColumnIndexToLetter(Column) + Row;
  }
}
