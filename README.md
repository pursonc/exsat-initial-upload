# Uploader

Create the .env file
```
 CHAIN_ID: ---
  EXSAT_API_URL: ---
  EXSAT_CONTRACT_NAME: ---
  EXSAT_PUSHER_NAME: ---
  EXSAT_PUSHER_PERMISSION: ---
  EXSAT_PRIVATE_KEY: ---
  START_ID: 0
  END_ID: 2000000
  PROGRESS_FILE:   progress.json
  TXID_LOG_FILE:   txid_log.json
  CLICKHOUSE_HOST: ---
  CLICKHOUSE_PORT: 8123
  CLICKHOUSE_USER: ---
  CLICKHOUSE_PASSWORD: ---
  CLICKHOUSE_DATABASE: ---
  CSV_FILE_PATH: ---
```
Run the script
```
npx tsc
node dist/index.js utxo 0 2000
node dist/index.js blocks /path/to/your/csvfile.csv
```
