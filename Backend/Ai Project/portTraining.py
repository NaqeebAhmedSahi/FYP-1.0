import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import SGD
from tensorflow.keras import Input

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Load intents
intents = json.loads(open("./Datasets/portfolio.json", encoding='utf-8').read())
print(f"Loaded intents with {len(intents['intents'])} categories")

# Preprocess data
words = []
classes = []
documents = []
ignore_letters = ['?', ',', '.', '!']

for intent in intents["intents"]:
    for pattern in intent["pattern"]:
        word_list = nltk.word_tokenize(pattern)
        words.extend(word_list)
        documents.append((word_list, intent["tag"]))
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

# Lemmatize and sort
words = [lemmatizer.lemmatize(word.lower()) for word in words if word not in ignore_letters]
words = sorted(set(words))
classes = sorted(set(classes))

# Save words and classes
pickle.dump(words, open('./PortfolioEssense/words.pkl', 'wb'))
pickle.dump(classes, open('./PortfolioEssense/classes.pkl', 'wb'))

# Split data
train_docs, val_docs = train_test_split(documents, test_size=0.1, random_state=42)

def create_features(docs):
    features = []
    labels = []
    output_empty = [0] * len(classes)
    
    for doc in docs:
        bag = []
        word_patterns = [lemmatizer.lemmatize(word.lower()) for word in doc[0]]
        for word in words:
            bag.append(1 if word in word_patterns else 0)
        
        output_row = list(output_empty)
        output_row[classes.index(doc[1])] = 1
        features.append(bag)
        labels.append(output_row)
    
    return np.array(features), np.array(labels)

train_X, train_y = create_features(train_docs)
val_X, val_y = create_features(val_docs)

# Model architecture
model = Sequential([
    Input(shape=(len(train_X[0]),)),  # Proper input layer
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(64, activation='relu'),
    Dropout(0.5),
    Dense(len(classes),  # No activation here for logits
])

# Adjust loss function based on number of classes
if len(classes) == 2:
    loss_fn = 'binary_crossentropy'
    final_activation = 'sigmoid'
else:
    loss_fn = 'categorical_crossentropy'
    final_activation = 'softmax'

model.layers[-1].activation = tf.keras.activations.get(final_activation)

# Optimizer without decay
optimizer = SGD(learning_rate=0.01, momentum=0.9, nesterov=True)

model.compile(loss=loss_fn, optimizer=optimizer, metrics=['accuracy'])

# Training with early stopping
early_stopping = tf.keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True
)

history = model.fit(
    train_X, train_y,
    epochs=40,
    batch_size=5,
    validation_data=(val_X, val_y),
    callbacks=[early_stopping],
    verbose=1
)

# Save model
model.save('./PortfolioEssense/chatbot_model1.keras')
print("Model training complete!")