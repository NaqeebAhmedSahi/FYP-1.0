from flask import Flask, request, jsonify
import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from autocorrect import Speller
import tensorflow as tf
from waitress import serve
import os

app = Flask(__name__)

# Download NLTK data
nltk.download('punkt')
nltk.download('wordnet')

# Initialize components
lemmatizer = WordNetLemmatizer()
spell = Speller(lang='en')

# File paths configuration
PROJECT_CONFIG = {
    'ecommerce': {
        'words_path': './EcommerceEssense/words.pkl',
        'classes_path': './EcommerceEssense/classes.pkl',
        'model_path': './EcommerceEssense/chatbot_model1.keras',
        'intents_path': './Datasets/e_image.json'
    },
    'blog': {
        'words_path': './BlogEssense/words.pkl',
        'classes_path': './BlogEssense/classes.pkl',
        'model_path': './BlogEssense/chatbot_model1.keras',
        'intents_path': './Datasets/blog.json'
    },
    'portfolio': {
        'words_path': './PortfolioEssense/words.pkl',
        'classes_path': './PortfolioEssense/classes.pkl',
        'model_path': './PortfolioEssense/chatbot_model1.keras',
        'intents_path': './Datasets/p3.json'
    }
}

# Global variables to hold loaded resources
words = None
classes = None
model = None
intents = None
current_type = None

def load_resources(project_type):
    """Load the appropriate NLP resources based on project type"""
    global words, classes, model, intents, current_type
    
    if project_type == current_type:
        return  # Already loaded
    
    config = PROJECT_CONFIG.get(project_type)
    if not config:
        raise ValueError(f"Unsupported project type: {project_type}")
    
    # Verify files exist
    for path in config.values():
        if not os.path.exists(path):
            raise FileNotFoundError(f"Resource file not found: {path}")
    
    # Load new resources
    words = pickle.load(open(config['words_path'], 'rb'))
    classes = pickle.load(open(config['classes_path'], 'rb'))
    model = tf.keras.models.load_model(config['model_path'])
    
    with open(config['intents_path'], encoding='utf-8') as file:
        intents = json.load(file)
    
    current_type = project_type
    print(f"Loaded resources for project type: {project_type}")

def clean_up_sentence(sentence):
    corrected_sentence = spell(sentence)
    sentence_words = nltk.word_tokenize(corrected_sentence)
    return [lemmatizer.lemmatize(word.lower()) for word in sentence_words]

def bow(sentence, words):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

def predict_intent(sentence):
    p = bow(sentence, words)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return [{"intent": classes[r[0]], "probability": str(r[1])} for r in results]

def get_response(intents_list, intents_json):
    tag = intents_list[0]['intent']
    for intent in intents_json['intents']:
        if intent['tag'] == tag:
            return random.choice(intent['response'])
    return "I didn't understand that. Could you rephrase?"

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    prompt = data.get('prompt', '')
    project_type = data.get('type', 'blog')  # Default to blog if not specified
    
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    try:
        # Load appropriate resources
        load_resources(project_type)
        
        # Process the request
        intents_list = predict_intent(prompt)
        response = get_response(intents_list, intents)
        
        # Debug output
        print("\n=== REQUEST PROCESSING ===")
        print(f"Project Type: {project_type}")
        print(f"User Prompt: {prompt}")
        print(f"Detected Intent: {intents_list[0]['intent']}")
        print(f"Confidence: {intents_list[0]['probability']}")
        print(f"Response: {response}")
        print("=========================\n")
        
        return jsonify({
            'response': response,
            'detected_intent': intents_list[0]['intent'],
            'confidence': intents_list[0]['probability'],
            'project_type': project_type
        })
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Pre-load default resources (blog)
    try:
        load_resources('blog')
    except Exception as e:
        print(f"Initial resource loading failed: {e}")
    
    serve(app, host="0.0.0.0", port=5001)