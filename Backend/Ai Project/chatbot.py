# chatbot.py
import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
import tensorflow as tf
import keras
from keras.models import load_model
import re



intents = json.loads(open("1.json", encoding='utf-8').read())

words = pickle.load(open("words.pkl", 'rb'))
classes = pickle.load(open("classes.pkl", 'rb'))

model = load_model('chatbot_model1.keras')

def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence )
    sentence_words =[lemmatizer.lemmatize(word) for word in sentence_words]
    return sentence_words

def bag_of_words(sentence):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for w in sentence_words:
        for i, word in enumerate(words):
            if word == w:
                bag[i] = 1
    # Ensure the bag has the correct length (39) to match the model's input shape
    bag = bag[:len(words)]

    return np.array(bag)



def predict_classes(sentence):
    bow = bag_of_words(sentence)
    res = model.predict(np.array([bow]))[0]
    ERROR_THRESHOLD = 0.50
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]

    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({'intent': classes[r[0]], 'probability': str(r[1])})

        # Check if the intent is "personal_name" and extract the name
        if classes[r[0]] == 'personal_name':
            name_pattern = re.compile(r'\[name\](.+)\[\/name\]')
            match = name_pattern.search(sentence)
            if match:
                name = match.group(1).strip()
                return_list[-1]['name'] = name

    return return_list

def get_response(intents_list, intents_json):
    tag = intents_list[0]['intent']
    list_of_intents = intents_json['intents']
    
    # Default response if no matching tag is found
    result = "I'm sorry, I didn't understand that."

    for i in list_of_intents:
        if i['tag'] == tag:
            result = random.choice(i['response'])
            break

    return result



print("Tell me the pattern so I give to relative response")

while True:
    message = input("")
    ints = predict_classes(message)
    print(ints)
    res = get_response(ints, intents)
    print(res)
    print(type(res))
    with open("chatbot_result.json", "w") as json_file:
        json.dump(res, json_file)
