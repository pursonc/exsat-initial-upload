import { Session } from "@wharfkit/session";
import { WalletPluginPrivateKey } from "@wharfkit/wallet-plugin-privatekey";
import { config } from "./config";
import { logTxId } from "./progress";
import dotenv from "dotenv";
dotenv.config();

const TYPE_UTXO = "utxo";
const TYPE_BLOCK = "block_header";
const RETRY_LIMIT = 5;
const RETRY_DELAY = 5000; // 5 seconds

console.log("config");
console.log(config);

const session = new Session({
  chain: {
    id: config.CHAIN_ID!,
    url: config.EXSAT_API_URL!,
  },
  actor: config.EXSAT_PUSHER_NAME,
  permission: config.EXSAT_PUSHER_PERMISSION,
  walletPlugin: new WalletPluginPrivateKey(config.EXSAT_PRIVATE_KEY!),
});

const powerup = async () => {
  const actions = [
    {
      account: "eosio",
      name: "powerup",
      authorization: [session.permissionLevel],
      data: {
        payer: config.EXSAT_PUSHER_NAME,
        receiver: config.EXSAT_PUSHER_NAME,
        days: 1,
        net_frac: 100000000000, // Adjust these values as needed
        cpu_frac: 100000000000, // Adjust these values as needed
        max_payment: "1.0000 EOS", // Adjust the amount as needed
      },
    },
  ];

  try {
    const result = await session.transact({ actions });
    const txid = result.resolved?.transaction.id || "-";
    console.log(`Powerup successful, txid: ${txid}`);
  } catch (e) {
    console.error("Error during powerup action:", e);
  }
};

export const uploadUTXOs = async (utxos: any[]) => {
  let actions: any = [];
  let last_id = 0;

  for (const utxo of utxos) {
    actions.push({
      account: config.EXSAT_CONTRACT_NAME!,
      name: "addutxo",
      authorization: [session.permissionLevel],
      data: {
        id: utxo.id,
        txid: utxo.txid,
        index: utxo.vout,
        scriptpubkey: utxo.scriptPubKey,
        value: utxo.value,
      },
    });
    last_id = utxo.id;
  }

  let success = false;
  let retryCount = 0;

  while (!success && retryCount < RETRY_LIMIT) {
    try {
      const result = await session.transact({ actions }, { broadcast: true });
      const txid = result.resolved?.transaction.id || "-";
      await logTxId(txid.toString(), TYPE_UTXO);
      console.error(`end_id:${last_id}   txid ${txid.toString()}`);
      success = true;
    } catch (e: any) {
      console.error(
        `Error uploading UTXO id: ${last_id}, retrying in ${
          RETRY_DELAY / 1000
        } seconds...`,
        e
      );

      if (e.message.includes("CPU") || e.message.includes("NET")) {
        console.log("Attempting to powerup...");
        await powerup();
      }

      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  if (!success) {
    console.error(
      `Failed to upload UTXO id: ${last_id} after ${RETRY_LIMIT} retries.`
    );
  }
};

export const uploadBlocks = async (blocks: any[]) => {
  let actions: any = [];
  let height = 0;

  for (const block of blocks) {
    actions.push({
      account: config.EXSAT_CONTRACT_NAME!,
      name: "addblock",
      authorization: [session.permissionLevel],
      data: {
        height: block.height,
        hash: block.hash,
        cumulative_work: block.chainwork,
        version: block.version,
        previous_block_hash:
          block.previousblockhash ||
          "0000000000000000000000000000000000000000000000000000000000000000",
        merkle: block.merkleroot,
        timestamp: block.time,
        bits: block.bits,
        nonce: block.nonce,
      },
    });
    height = block.height;
  }

  let success = false;
  let retryCount = 0;

  while (!success && retryCount < RETRY_LIMIT) {
    try {
      const result = await session.transact({ actions }, { broadcast: true });
      const txid = result.resolved?.transaction.id || "-";
      await logTxId(txid.toString(), TYPE_BLOCK);
      console.error(`end_height:${height}   txid ${txid.toString()}`);
      success = true;
    } catch (e: any) {
      console.error(
        `Error uploading block end_height: ${height}, retrying in ${
          RETRY_DELAY / 1000
        } seconds...`,
        e
      );

      if (e.message.includes("CPU") || e.message.includes("NET")) {
        console.log("Attempting to powerup...");
        await powerup();
      }

      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  if (!success) {
    console.error(
      `Failed to upload block end_height: ${height} after ${RETRY_LIMIT} retries.`
    );
  }
};
