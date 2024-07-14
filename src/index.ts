import { getUTXOs } from "./clickhouse";
import { getCSVData } from "./csv";
import { uploadBlocks, uploadUTXOs } from "./leap";
import { saveProgress, getProgress } from "./progress";
import { Command } from "commander";
import { logger } from "./logger";

const program = new Command();

const TYPE_UTXO="utxo";
const TYPE_BLOCK="block_header";

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
      const utxos = await getUTXOs(start, start + 1999);
      if (utxos.length === 0) break;

      await uploadUTXOs(utxos);
      start += 2000;
      await saveProgress(start, TYPE_UTXO);

      logger.info(`Uploaded UTXOs from ID ${start - 2000} to ${start - 1}`);
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
      const blocks = await getCSVData(csvPath, csvStartRow, csvStartRow + 1999);
      if (blocks.length === 0) break;

      await uploadBlocks(blocks);
      csvStartRow += 2000;
      await saveProgress(csvStartRow, TYPE_BLOCK);

      logger.info(
        `Uploaded blocks from row ${csvStartRow - 2000} to ${csvStartRow - 1}`
      );
    }

    logger.info("Block upload complete.");
  });

program.parse(process.argv);