import { Session } from "@wharfkit/session";
import { WalletPluginPrivateKey } from "@wharfkit/wallet-plugin-privatekey";
import { config } from "./config";
import { logTxId } from "./progress";
import dotenv from "dotenv";
dotenv.config();

const TYPE_UTXO = "utxo";
const TYPE_BLOCK = "block_header";
console.log("config")
console.log(config)

  const session = new Session({
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
    actions.push(
      {
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
      },
    );
    last_id = utxo.id;
  }

    try {

  

      const result = await session.transact({ actions }, { broadcast: true });
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
  console.log(actions[0])
 
    try {
      const result = await session.transact({ actions }, { broadcast: true });
      const txid = result.resolved?.transaction.id || "-";
      await logTxId(txid.toString(), TYPE_BLOCK);
      console.error(`end_height:${height}   txid ${txid.toString()}`);
    } catch (e) {
      console.error(`Error uploading block end_height: ${height}`, e);
    }
  };
