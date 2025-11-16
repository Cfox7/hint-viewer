import http.server
import socketserver
import subprocess
import threading
import time
from urllib.parse import urlparse

class TwitchExtensionHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # CORS headers for Twitch extension
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('X-Frame-Options', 'ALLOWALL')
        self.send_header('ngrok-skip-browser-warning', 'true')
        
        # Disable caching
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        print(f"Request: {self.path}")
        # Parse URL to remove query parameters
        parsed_url = urlparse(self.path)
        self.path = parsed_url.path
        
        # Handle root path
        if self.path == '/':
            self.path = '/index.html'
        
        return super().do_GET()

PORT = 8081

# Kill existing processes
subprocess.run(['pkill', '-f', 'ngrok'], capture_output=True)

# Start ngrok
def start_ngrok():
    subprocess.Popen(['ngrok', 'http', str(PORT)], 
                    stdout=subprocess.DEVNULL, 
                    stderr=subprocess.DEVNULL)

threading.Thread(target=start_ngrok, daemon=True).start()
time.sleep(3)

# Start server
try:
    with socketserver.TCPServer(("", PORT), TwitchExtensionHandler) as httpd:
        httpd.allow_reuse_address = True
        print(f"Server: http://localhost:{PORT}/")
        print(f"Ngrok: http://localhost:4040")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nStopping...")