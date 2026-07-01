import json
import os

path = "/var/log/suricata/eve.json"
if os.path.exists(path):
    with open(path, "r") as f:
        lines = f.readlines()
        print(f"Total lines in log: {len(lines)}")
        alerts = [line for line in lines if "alert" in line]
        print(f"Number of alerts found: {len(alerts)}")
else:
    print("Log file not found!")
