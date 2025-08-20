from flask import Flask, render_template, request
from .fake_camera import video_feed
from .logger import log_event

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/video_feed")
def feed():
    return video_feed()

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    log_event("login_attempt", {"username": username, "password": password, "ip": request.remote_addr})
    return "Login failed"  # Always fail for honeypot
