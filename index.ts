import * as fs from "fs";
import * as path from "path";

function printDirectoryTree(dirPath: string, indent: string = ""): void {
  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      console.log(`${indent}> ${item}`);
      printDirectoryTree(itemPath, indent + "  ");
    } else {
      console.log(`${indent}- ${item}`);
    }
  });
}

printDirectoryTree("./src");
