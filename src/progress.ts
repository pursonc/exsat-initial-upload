import fs from "fs-extra";
import { config } from "./config";

export const saveProgress = async (startId: number, type: string) => {
  await fs.writeJson(`${type}-${config.PROGRESS_FILE}`, { startId });
};

export const getProgress = async (type: string) => {
  try {
    const data = await fs.readJson(`${type}-${config.PROGRESS_FILE}`);
    return data.startId;
  } catch {
    return config.START_ID;
  }
};

export const logTxId = async (txId: string, type: string) => {
  const txIds = await getTxIds(type);
  txIds.push(txId);
  await fs.writeJson(`${type}-${config.TXID_LOG_FILE}`, txIds);
};

export const getTxIds = async (type: string) => {
  try {
    const data = await fs.readJson(`${type}-${config.TXID_LOG_FILE}`);
    return data;
  } catch {
    return [];
  }
};
