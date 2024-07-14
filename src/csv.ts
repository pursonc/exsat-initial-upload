import fs from "fs";
import csvParser from "csv-parser";

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

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ";" }))
      .on("data", (data) => {
        if (rowCount >= startRow && rowCount <= endRow) {
          results.push({
            hash: data.hash,
            height: parseInt(data.height, 10),
            version: parseInt(data.version, 10),
            previousblockhash: data.previousblockhash,
            nextblockhash: data.nextblockhash,
            merkleroot: data.merkleroot,
            time: parseInt(data.time, 10),
            bits: parseInt(data.bits, 10),
            nonce: parseInt(data.nonce, 10),
            difficulty: parseFloat(data.difficulty),
            chainwork: data.chainwork,
          });
        }
        rowCount++;
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
