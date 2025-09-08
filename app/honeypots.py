import socket
import threading
from logger import log_event

# Use a lock to prevent race conditions when multiple threads log simultaneously
log_lock = threading.Lock()

def handle_client(client_socket, service_name, handler_func):
    """Generic client handler."""
    try:
        source_ip, source_port = client_socket.getpeername()
        with log_lock:
            log_event(
                service=service_name,
                source_ip=source_ip,
                source_port=source_port,
                event_type='connection_established',
                details={'message': f'New connection to {service_name} honeypot'}
            )
        handler_func(client_socket, source_ip, source_port)
    except Exception as e:
        print(f"[{service_name}] Error handling client: {e}")
    finally:
        client_socket.close()

def telnet_handler(client, ip, port):
    """Handles fake Telnet interactions."""
    try:
        client.sendall(b"Username: ")
        username = client.recv(1024).strip().decode(errors='ignore')
        client.sendall(b"Password: ")
        password = client.recv(1024).strip().decode(errors='ignore')
        with log_lock:
            log_event(
                service='telnet',
                source_ip=ip,
                source_port=port,
                event_type='login_attempt',
                details={'username': username, 'password': password}
            )
    except socket.error as e:
        print(f"[telnet] Socket error: {e}")

def http_handler(client, ip, port):
    """Handles fake HTTP (IP Camera) interactions."""
    try:
        request_data = client.recv(4096).decode(errors='ignore')
        if request_data:
            first_line = request_data.split('\n')[0]
            parts = first_line.split(' ')
            if len(parts) >= 2:
                method, path = parts[0], parts[1]
                with log_lock:
                    log_event(
                        service='http',
                        source_ip=ip,
                        source_port=port,
                        event_type='http_request',
                        details={'method': method, 'path': path, 'raw_request': request_data}
                    )
        # Fake response
        response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<h1>IP Camera Login</h1><p>Access Denied.</p>"
        client.sendall(response.encode())
    except socket.error as e:
        print(f"[http] Socket error: {e}")

def mqtt_handler(client, ip, port):
    """Detects and logs MQTT connection attempts."""
    try:
        # Just receive a bit of data to confirm it's a probe
        client.recv(1024)
        with log_lock:
            log_event(
                service='mqtt',
                source_ip=ip,
                source_port=port,
                event_type='mqtt_probe',
                details={'message': 'MQTT connection attempt detected'}
            )
    except socket.error as e:
        print(f"[mqtt] Socket error: {e}")

def run_honeypot(port, service_name, handler_func):
    """Generic honeypot server loop."""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', port))
    server.listen(100)
    
    while True:
        client_sock, _ = server.accept()
        client_handler_thread = threading.Thread(
            target=handle_client,
            args=(client_sock, service_name, handler_func)
        )
        client_handler_thread.start()

def run_telnet_honeypot():
    run_honeypot(2323, 'telnet', telnet_handler)

def run_http_honeypot():
    run_honeypot(8080, 'http', http_handler)
    
def run_mqtt_honeypot():
    run_honeypot(1883, 'mqtt', mqtt_handler)
