import dotenv from "dotenv";
dotenv.config();

export const config = {
  CHAIN_ID: process.env.CHAIN_ID,
  EXSAT_API_URL: process.env.EXSAT_API_URL,
  EXSAT_CONTRACT_NAME: process.env.EXSAT_CONTRACT_NAME,
  EXSAT_PUSHER_NAME: process.env.EXSAT_PUSHER_NAME,
  EXSAT_PUSHER_PERMISSION: process.env.EXSAT_PUSHER_PERMISSION,
  EXSAT_PRIVATE_KEY: process.env.EXSAT_PRIVATE_KEY,
  START_ID: parseInt(process.env.START_ID || "0"),
  END_ID: parseInt(process.env.END_ID || "2000000"),
  PROGRESS_FILE: process.env.PROGRESS_FILE || "progress.json",
  TXID_LOG_FILE: process.env.TXID_LOG_FILE || "txid_log.json",
  CLICKHOUSE_HOST: process.env.CLICKHOUSE_HOST,
  CLICKHOUSE_PORT: parseInt(process.env.CLICKHOUSE_PORT || "8123"),
  CLICKHOUSE_USER: process.env.CLICKHOUSE_USER,
  CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD,
  CLICKHOUSE_DATABASE: process.env.CLICKHOUSE_DATABASE,
  CSV_FILE_PATH: process.env.CSV_FILE_PATH!,
};
