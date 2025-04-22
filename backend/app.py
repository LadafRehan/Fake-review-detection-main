from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model and vectorizer
model = joblib.load('../Model Trainer/model.pkl')
vectorizer = joblib.load('../Model Trainer/vectorizer.pkl')

@app.route('/analyze', methods=['POST'])
def analyze_reviews():
    data = request.get_json()

    if not data or 'reviews' not in data:
        return jsonify({"error": "Invalid JSON format or missing 'reviews' key"}), 400

    reviews_data = data['reviews']

    # Ensure it's a list of dictionaries with required keys
    if not isinstance(reviews_data, list) or not all('Review_Text' in item and 'Rating' in item for item in reviews_data):
        return jsonify({"error": "Each review must contain 'Review_Text' and 'Rating'"}), 400

    # Convert to DataFrame
    df = pd.DataFrame(reviews_data)

    # Vectorize the reviews
    reviews_vectorized = vectorizer.transform(df['Review_Text'])

    # Make predictions
    predictions = model.predict(reviews_vectorized)

    # Calculate fake review statistics
    fake_count = sum(predictions == 0)
    total_reviews = len(predictions)
    fake_percentage = (fake_count / total_reviews) * 100
    product_status = "Fake" if fake_percentage >= 50 else "Genuine"

    return jsonify({
        "total_reviews": int(total_reviews),
        "fake_reviews": int(fake_count),
        "fake_percentage": float(fake_percentage),
        "product_status": product_status
    })

if __name__ == '__main__':
    app.run(debug=True)
