from app.dashboard import app
from app.proxy_overlay import start_proxy
import threading

# Start proxy overlay in separate thread
threading.Thread(target=start_proxy, daemon=True).start()

# Start fake camera dashboard
app.run(host="0.0.0.0", port=5000)
