import Parser from "./Parser";
import Cell from "./ast/spreadsheet/Cell";

const InterpreterService = () => {
  const columnToNumber = (column: string): number => {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return result;
  };

  const extractCells = (input: string) => {
    const refs = new Array<string>();
    const parser = Parser(input);
    while (parser.hasMoreTokens()) {
      const token = parser.parseCell();
      if (token instanceof Cell) refs.push(token.view);
    }
    return refs;
  };

  return { columnToNumber, extractCells };
};

export default InterpreterService;
