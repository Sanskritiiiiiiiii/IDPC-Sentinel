import socket
import time

def start_flood():
    target_ip = "127.0.0.1"
    target_port = 8000
    # Create a UDP socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    print("Triggering flood in 3 seconds...")
    time.sleep(3)
    
    # Send a burst of packets to spike network counters
    print("Flooding now...")
    for i in range(10000):
        sock.sendto(b"X" * 1024, (target_ip, target_port))
    
    print("Burst finished. Check your dashboard for the block!")

if __name__ == "__main__":
    start_flood()
