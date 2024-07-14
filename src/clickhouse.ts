import { ClickHouse } from "clickhouse";
import { config } from "./config";

const clickhouse = new ClickHouse({
  url: `http://${config.CLICKHOUSE_HOST}:${config.CLICKHOUSE_PORT}`,
  basicAuth: {
    username: config.CLICKHOUSE_USER,
    password: config.CLICKHOUSE_PASSWORD,
  },
  database: config.CLICKHOUSE_DATABASE,
});

export const getUTXOs = async (startId: number, endId: number, chunk: number) => {
  const query = `
    SELECT id, height, address, txid, vout, value, scriptPubKey
    FROM deduped_utxos
    WHERE id BETWEEN ${startId} AND ${endId}
    ORDER BY id
    LIMIT ${chunk}
  `;
  return await clickhouse.query(query).toPromise();
};
