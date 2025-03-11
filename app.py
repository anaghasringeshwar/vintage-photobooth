from flask import Flask, render_template, request, jsonify
import base64
import os
from datetime import datetime  # For unique filenames

app = Flask(__name__)

UPLOAD_FOLDER = 'static/photos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def homepage():
    return render_template('index.html')

@app.route('/photobooth')
def photobooth():
    return render_template('photobooth.html')

@app.route('/save_photo', methods=['POST'])
def save_photo():
    try:
        data = request.json['photo']
        photo_data = data.split(',')[1]  # Remove 'data:image/png;base64,' part
        photo_bytes = base64.b64decode(photo_data)

        # Create a unique filename using timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        photo_path = os.path.join(UPLOAD_FOLDER, f'photo_{timestamp}.png')

        with open(photo_path, 'wb') as photo_file:
            photo_file.write(photo_bytes)

        return jsonify({"status": "success", "photo_path": f"/{photo_path}"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
