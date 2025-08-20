from flask import Response
import cv2
from .logger import log_event

VIDEO_PATH = "static/sample_video.mp4"

def generate_frames():
    video = cv2.VideoCapture(VIDEO_PATH)
    while True:
        success, frame = video.read()
        if not success:
            video.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

def video_feed():
    log_event("video_access", {"message": "Someone accessed the video feed"})
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
