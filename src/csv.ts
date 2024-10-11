import fs from "fs";
import readline from "readline";

interface Block {
  hash: string;
  height: number;
  version: number;
  previousblockhash: string;
  nextblockhash: string;
  merkleroot: string;
  time: number;
  bits: number;
  nonce: number;
  difficulty: number;
  chainwork: string;
}

export const getCSVData = async (
  filePath: string,
  startRow: number,
  endRow: number
): Promise<Block[]> => {
  const results: Block[] = [];
  let rowCount = 0;

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  return new Promise((resolve, reject) => {
    rl.on("line", (line) => {
      if (rowCount >= startRow && rowCount <= endRow) {
        const columns = line.split(";");
        if (columns.length === 11) {
          results.push({
            hash: `${columns[0]}`,
            height: parseInt(columns[1], 10),
            version: parseInt(columns[2], 10),
            previousblockhash: `${columns[3]}`,
            nextblockhash: columns[4],
            merkleroot: `${columns[5]}`,
            time: parseInt(columns[6], 10),
            bits: parseInt(columns[7], 16),
            nonce: parseInt(columns[8], 10),
            difficulty: parseFloat(columns[9]),
            chainwork: `${columns[10]}`,
          });
        }
      }
      rowCount++;
    });

    rl.on("close", () => {
      resolve(results);
    });

    rl.on("error", (error) => {
      reject(error);
    });
  });
};
