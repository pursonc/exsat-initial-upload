import { Session } from "@wharfkit/session";
import { WalletPluginPrivateKey } from "@wharfkit/wallet-plugin-privatekey";
import { config } from "./config";
import { logTxId } from "./progress";

const TYPE_UTXO = "utxo";
const TYPE_BLOCK = "block_header";

const args = {
  chain: {
    id: config.CHAIN_ID,
    url: config.EXSAT_API_URL,
  },
  actor: config.EXSAT_PUSHER_NAME,
  permission: config.EXSAT_PUSHER_PERMISSION,
  walletPlugin: new WalletPluginPrivateKey(config.EXSAT_PRIVATE_KEY!),
};

const session = new Session(
  {
  chain: {
    id: config.CHAIN_ID!,
    url: config.EXSAT_API_URL!,
  },
  actor: config.EXSAT_PUSHER_NAME,
  permission: config.EXSAT_PUSHER_PERMISSION,
  walletPlugin: new WalletPluginPrivateKey(config.EXSAT_PRIVATE_KEY!),
});

export const uploadUTXOs = async (utxos: any[]) => {
  let actions: any = []
  let last_id = 0;
  
  for (const utxo of utxos) {
    const actions = [
      {
        account: config.EXSAT_CONTRACT_NAME!,
        name: "addutxo",
        authorization: [
          session.permissionLevel
        ],
        data: {
          id: utxo.id+1,
          txid: utxo.txid,
          index: utxo.vout,
          scriptpubkey: utxo.scriptPubKey,
          value: utxo.value,
        },
      },
    ];
    last_id = utxo.id;
  }
    try {
      const result = await session.transact(
        { actions }
      );
      const txid = result.resolved?.transaction.id || "-";
      await logTxId(txid.toString(), TYPE_UTXO);
       console.error(`end_id:${last_id}   txid ${txid.toString()}`);
    } catch (e) {
      console.error(`Error uploading UTXO id: ${last_id}`, e);
    }
  
};

export const uploadBlocks = async (blocks: any[]) => {
  let actions:any = []
  let height = 0
  for (const block of blocks) {
     actions.push([
      {
        account: config.EXSAT_CONTRACT_NAME!,
        name: "addblock",
        authorization: [
          session.permissionLevel
        ],
        data: {
          height: block.height,
          hash: block.hash,
          cumulative_work: block.cumulative_work,
          version: block.version,
          previous_block_hash: block.previous_block_hash,
          merkle: block.merkle,
          timestamp: block.timestamp,
          bits: block.bits,
          nonce: block.nonce,
        },
      },
    ]);
    height = block.height;
  }

    try {
      const result = await session.transact({ actions });
      const txid = result.resolved?.transaction.id || "-";
      await logTxId(txid.toString(), TYPE_BLOCK);
      console.error(`end_height:${height}   txid ${txid.toString()}`);
    } catch (e) {
      console.error(`Error uploading block end_height: ${height}`, e);
    }
  };
