from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests
import base64

load_dotenv()
app = Flask(__name__)

# Set your Hugging Face model API URL and API token
API_URL = "https://api-inference.huggingface.co/models/b0c-beep/ft-plant-identifier"  # Replace with your model path
API_TOKEN = os.getenv("REACT_APP_HUGGINGFACE_API_TOKEN")

if not API_TOKEN:
    raise ValueError("Hugging Face API token not found in environment variables.")

LABEL_MAP = {
    0: "Aloe vera",
    1: "Banana",
    2: "Bilimbi",
    3: "Cantaloupe",
    4: "Cassava",
    5: "Coconut",
    6: "Corn",
    7: "Cucumber",
    8: "Curcuma",
    9: "Eggplant",
    10: "Galangal",
    11: "Ginger",
    12: "Guava",
    13: "Kale",
    14: "Longbeans",
    15: "Mango",
    16: "Melon",
    17: "Orange",
    18: "Paddy",
    19: "Papaya",
    20: "Peperchili",  
    21: "Pineapple",
    22: "Pomelo",
    23: "Shallot",
    24: "Soybeans",
    25: "Spinach",
    26: "Sweetpotatoes",
    27: "Tobacco",
    28: "Waterapple",
    29: "Watermelon",
}

# Function to classify an image using the Hugging Face API
def classify_image(encoded_image):
    payload = {"inputs": encoded_image}
    headers = {"Authorization": f"Bearer {API_TOKEN}", "Content-Type": "application/json"}
    
    response = requests.post(API_URL, headers=headers, json=payload)

    if response.status_code == 200:
        predictions = response.json()
        
        # Extract the label from the first prediction (highest score)
        predicted_label = predictions[0]['label']  # e.g., 'LABEL_17'
        
        # Extract the numeric part from the label
        predicted_class = int(predicted_label.split('_')[1])  # Get the numeric part
        
        # Get the corresponding plant name
        plant_name = LABEL_MAP[predicted_class]
        
        return plant_name, predictions[0]['score']
    else:
        return None, response.text

@app.route('/classify', methods=['POST'])
def classify():
    print("Request received")
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    image_bytes = image_file.read()
    encoded_image = base64.b64encode(image_bytes).decode('utf-8')

    plant_name, confidence = classify_image(encoded_image)
    
    if plant_name:
        return jsonify({'plant_name': plant_name, 'confidence': confidence}), 200
    else:
        return jsonify({'error': confidence}), 500


@app.route('/test', methods=['GET'])
def test():
    return jsonify(message="Server is reachable!"), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
