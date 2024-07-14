import { getUTXOs } from "./clickhouse";
import { getCSVData } from "./csv";
import { uploadBlocks, uploadUTXOs } from "./leap";
import { saveProgress, getProgress } from "./progress";
import { Command } from "commander";
import { logger } from "./logger";

const program = new Command();

const TYPE_UTXO="utxo";
const TYPE_BLOCK="block_header";
const WAIT = 2000;
const CHUNK_SIZE=2000;


program
  .name("utxo-uploader")
  .description("CLI to upload UTXOs and Blocks to EOS blockchain")
  .version("0.1.0");

program
  .command("utxo")
  .description("Upload UTXOs to EOS")
  .argument("<startId>", "Start ID")
  .argument("<endId>", "End ID")
  .action(async (startId: string, endId: string) => {
    let start = parseInt(startId, 10);
    const end = parseInt(endId, 10);

    while (start <= end) {
      const utxos = await getUTXOs(start, start + CHUNK_SIZE-1, CHUNK_SIZE);
      if (utxos.length === 0) break;

      await uploadUTXOs(utxos);
      start += CHUNK_SIZE;
      await saveProgress(start, TYPE_UTXO);

      logger.info(
        `Uploaded UTXOs from ID ${start - CHUNK_SIZE} to ${start - 1}`
      );
      await new Promise((resolve) => setTimeout(resolve, WAIT)); 
    }

    logger.info("UTXO upload complete.");
  });

program
  .command("blocks")
  .description("Upload Blocks to EOS")
  .argument("<csvPath>", "CSV file path")
  .argument("<s>", "Start ID")
  .argument("<e>", "End ID")
  .action(async (csvPath: string) => {
    let csvStartRow = await getProgress(TYPE_BLOCK);

    while (true) {
      const blocks = await getCSVData(
        csvPath,
        csvStartRow,
        csvStartRow + CHUNK_SIZE
      -1);

       if (blocks.length === 0) break;

      //  console.log(blocks)

      await uploadBlocks(blocks);
      csvStartRow += CHUNK_SIZE;
      await saveProgress(csvStartRow, TYPE_BLOCK);

      logger.info(
        `Uploaded blocks from row ${csvStartRow - CHUNK_SIZE} to ${
          csvStartRow - 1
        }`
      );
      await new Promise((resolve) => setTimeout(resolve, WAIT)); 
    }

    logger.info("Block upload complete.");
  });

program.parse(process.argv);