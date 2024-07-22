import json
import subprocess
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_table_data(lower_bound, limit=1000):
    cmd = f"cleos get table utxomng.xsat utxomng.xsat utxos -l {limit} -L {lower_bound}"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout)

def find_missing_ids(start, end):
    missing_ids = []
    current_id = start
    lower_bound = str(start)

    while current_id <= end:
        data = get_table_data(lower_bound)
        rows = data['rows']
        
        if not rows:
            break

        for row in rows:
            while current_id < row['id']:
                missing_ids.append(current_id)
                current_id += 1
            current_id = row['id'] + 1

        if not data['more']:
            break
        lower_bound = data['next_key']

    while current_id <= end:
        missing_ids.append(current_id)
        current_id += 1

    return missing_ids

def write_missing_ids_to_file(segment, missing_ids):
    start, end = segment
    filename = f"missing_ids_{start}_{end}.txt"
    with open(filename, 'w') as f:
        f.write(f"Missing IDs for segment {start} - {end}:\n")
        for id in missing_ids:
            f.write(f"{id}\n")
    print(f"Wrote missing IDs for segment {start} - {end} to {filename}")

def main():
    total_range = 92508552  # 0 to 92508551
    segment_size = 1000000
    segments = [(i, min(i + segment_size - 1, total_range - 1)) for i in range(0, total_range, segment_size)]

    all_missing_ids = []

    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_segment = {executor.submit(find_missing_ids, start, end): (start, end) for start, end in segments}
        
        for future in as_completed(future_to_segment):
            segment = future_to_segment[future]
            try:
                missing_ids = future.result()
                all_missing_ids.extend(missing_ids)
                print(f"Processed segment {segment}: Found {len(missing_ids)} missing IDs")
                write_missing_ids_to_file(segment, missing_ids)
            except Exception as exc:
                print(f"Segment {segment} generated an exception: {exc}")

    print(f"Total missing IDs: {len(all_missing_ids)}")
    
    # Write summary to a file
    with open("missing_ids_summary.txt", 'w') as f:
        f.write(f"Total missing IDs: {len(all_missing_ids)}\n")
        f.write("Summary of missing IDs by segment:\n")
        for start, end in segments:
            filename = f"missing_ids_{start}_{end}.txt"
            with open(filename, 'r') as segment_file:
                count = sum(1 for line in segment_file) - 1  # Subtract 1 for the header line
            f.write(f"Segment {start} - {end}: {count} missing IDs\n")

if __name__ == "__main__":
    main()