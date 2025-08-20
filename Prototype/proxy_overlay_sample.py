import socket
import threading
from .logger import log_event

LISTEN_IP = "0.0.0.0"
LISTEN_PORT = 10000
TARGET_IP = "192.168.1.50"  # Real device
TARGET_PORT = 80

def handle_client(client_socket):
    data = client_socket.recv(1024)
    log_event("proxy_hit", {"data": data.decode(errors="ignore")})
    # For demo, just drop or respond with fake data
    client_socket.send(b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nFake IoT Response\n")
    client_socket.close()

def start_proxy():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((LISTEN_IP, LISTEN_PORT))
    server.listen(5)
    while True:
        client, addr = server.accept()
        threading.Thread(target=handle_client, args=(client,)).start()
