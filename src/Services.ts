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

  static LetterToColumnIndex(Letter: string): number {
    let Result = 0;
    for (let Index = 0; Index < Letter.length; Index++) {
      const CharCode = Letter.charCodeAt(Index) - 65 + 1;
      Result = Result * 26 + CharCode;
    }
    return Result;
  }

  static NotationA1(Row: number, Column: number) {
    return this.ColumnIndexToLetter(Column) + Row;
  }
}
