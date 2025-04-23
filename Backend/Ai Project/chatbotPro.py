import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from autocorrect import Speller  # For autocorrection
import tensorflow as tf

# Download NLTK data (if not already downloaded)
nltk.download('punkt')
nltk.download('wordnet')

# Load preprocessing files and model
lemmatizer = WordNetLemmatizer()
spell = Speller(lang='en')  # Initialize autocorrect
words = pickle.load(open('words.pkl', 'rb'))
classes = pickle.load(open('classes.pkl', 'rb'))
model = tf.keras.models.load_model('chatbot_model1.keras')

# Load intents data
intents = json.loads(open("1.json", encoding='utf-8').read())

# Preprocess input prompt
def clean_up_sentence(sentence):
    # Autocorrect the sentence
    corrected_sentence = spell(sentence)
    print(f"Autocorrected Input: {corrected_sentence}")
    
    # Tokenize and lemmatize
    sentence_words = nltk.word_tokenize(corrected_sentence)
    base_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    print(f"Base Words: {base_words}")
    return base_words

# Convert sentence to bag of words
def bow(sentence, words):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

# Predict the intent
def predict_intent(sentence):
    p = bow(sentence, words)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list

# Get response based on predicted intent
def get_response(intents_list, intents_json):
    tag = intents_list[0]['intent']
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        if i['tag'] == tag:
            result = random.choice(i['response'])
            break
    return result

# Main function to interact with the chatbot
def chatbot_response(prompt):
    intents_list = predict_intent(prompt)
    response = get_response(intents_list, intents)
    return response

# Example usage
if __name__ == "__main__":
    while True:
        prompt = input("You: ")
        if prompt.lower() in ["quit", "exit", "bye"]:
            print("Chatbot: Goodbye!")
            break
        response = chatbot_response(prompt)
        print("Chatbot:", response)