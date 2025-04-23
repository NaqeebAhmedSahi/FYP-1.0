import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.model_selection import train_test_split  # Import train_test_split
# nltk.download('punkt')
# nltk.download('wordnet')
# nltk.download('punkt_tab')
import tensorflow as tf
from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout
from keras.optimizers import SGD

lemmatizer = WordNetLemmatizer()
intents = json.loads(open("./Datasets/e_image.json", encoding='utf-8').read())
print(json.dumps(intents, indent=4, ensure_ascii=False)) 
words = []
classes = []
documents = []
ignore_letters = ['?', ',', '.', '!']
count=0
for intent in intents["intents"]:
    count+=1
    print(count)
    for pattern in intent["pattern"]:
        
        
        wordList = nltk.word_tokenize(pattern)
        words.extend(wordList)
        documents.append((wordList, intent["tag"]))
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

# Lemmatize the words
words = [lemmatizer.lemmatize(word) for word in words if word not in ignore_letters]
words = sorted(set(words))

classes = sorted(set(classes))

pickle.dump(words, open('./EcommerceEssense/words.pkl', 'wb'))
pickle.dump(classes, open('./EcommerceEssense/classes.pkl', 'wb'))

# Split the data into training and validation sets
train_documents, val_documents = train_test_split(documents, test_size=0.1, random_state=42)

training = []
output_empty = [0] * len(classes)

for document in train_documents:
    bag = []
    word_patterns = document[0]
    word_patterns = [lemmatizer.lemmatize(word.lower()) for word in word_patterns]
    for word in words:
        bag.append(1) if word in word_patterns else bag.append(0)
    output_row = list(output_empty)
    output_row[classes.index(document[1])] = 1
    training.append([bag, output_row])

validation = []
for document in val_documents:
    bag = []
    word_patterns = document[0]
    word_patterns = [lemmatizer.lemmatize(word.lower()) for word in word_patterns]
    for word in words:
        bag.append(1) if word in word_patterns else bag.append(0)
    output_row = list(output_empty)
    output_row[classes.index(document[1])] = 1
    validation.append([bag, output_row])

random.shuffle(training)
random.shuffle(validation)

train_X = np.array([item[0] for item in training])
train_Y = np.array([item[1] for item in training])

val_X = np.array([item[0] for item in validation])
val_Y = np.array([item[1] for item in validation])

model = Sequential()
model.add(Dense(128, input_shape=(len(train_X[0]),), activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(len(train_Y[0]), activation='softmax'))

sgd = tf.keras.optimizers.SGD(learning_rate=0.01, decay=1e-6, momentum=0.9, nesterov=True)

model.compile(loss='categorical_crossentropy', optimizer=sgd, metrics=['accuracy'])

hist = model.fit(train_X, train_Y, epochs=40, batch_size=5, verbose=1, validation_data=(val_X, val_Y))  # Add validation_data

model.save('./EcommerceEssense/chatbot_model1.keras')
print("done")
