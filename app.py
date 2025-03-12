from flask import Flask, render_template, request, jsonify
import base64
import os
from datetime import datetime  # For unique filenames
from PIL import Image, ImageOps, ImageEnhance  # For vintage effect

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

        # Save the original image temporarily
        temp_path = os.path.join(UPLOAD_FOLDER, 'temp_photo.png')
        with open(temp_path, 'wb') as temp_file:
            temp_file.write(photo_bytes)

        # Apply vintage effect
        with Image.open(temp_path) as img:
            # Convert to grayscale
            img = ImageOps.grayscale(img)

            # Add contrast for a deeper vintage effect
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.5)

            # Add a vintage border
            border_color = (139, 69, 19)  # Vintage brown
            border_width = 15
            img_with_border = ImageOps.expand(img, border=border_width, fill=border_color)

            # Save the processed image
            img_with_border.save(photo_path)

        # Remove the temporary image
        os.remove(temp_path)

        return jsonify({"status": "success", "photo_path": f"/{photo_path}"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
