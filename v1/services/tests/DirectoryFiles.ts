import fs from "fs";
import path from "path";

function DirectoryFiles(folderPath: string, target = ".txt", filePaths = []): string[] {
  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      DirectoryFiles(filePath, target, filePaths);
    } else {
      if (filePath.endsWith(target)) filePaths.push(filePath);
    }
  });

  return filePaths;
}

export default DirectoryFiles;
