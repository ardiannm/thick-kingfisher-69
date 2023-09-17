const InterpreterService = () => {
  const columnToNumber = (column: string): number => {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return result;
  };

  return { columnToNumber };
};

export default InterpreterService;
