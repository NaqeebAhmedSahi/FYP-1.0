import random
import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.model_selection import train_test_split
import tensorflow as tf
from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout
from keras.optimizers import SGD
from sklearn.metrics import precision_score, recall_score, f1_score
import pandas as pd
import csv

lemmatizer = WordNetLemmatizer()
intents = json.loads(open("./Datasets/e_image.json", encoding='utf-8').read())

words = []
classes = []
documents = []
ignore_letters = ['?', ',', '.', '!']

for intent in intents["intents"]:
    for pattern in intent["pattern"]:
        wordList = nltk.word_tokenize(pattern)
        words.extend(wordList)
        documents.append((wordList, intent["tag"]))
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

words = [lemmatizer.lemmatize(word) for word in words if word not in ignore_letters]
words = sorted(set(words))
classes = sorted(set(classes))

pickle.dump(words, open('./EcommerceEssense/words.pkl', 'wb'))
pickle.dump(classes, open('./EcommerceEssense/classes.pkl', 'wb'))

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

# Create a CSV file to store training metrics
csv_file = './EcommerceEssense/training_metrics.csv'
with open(csv_file, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['Epoch', 'Samples', 'Correct', 'Failed', 'Accuracy'])

class MetricsCallback(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):
        # Predict on validation data
        val_predictions = np.argmax(model.predict(val_X), axis=1)
        val_true = np.argmax(val_Y, axis=1)
        
        # Calculate metrics
        correct = np.sum(val_predictions == val_true)
        failed = len(val_predictions) - correct
        accuracy = logs['val_accuracy']
        
        # Write to CSV
        with open(csv_file, mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([epoch + 1, len(val_X), correct, failed, accuracy])

# Train the model with the callback
hist = model.fit(train_X, train_Y, epochs=40, batch_size=5, verbose=1, 
                 validation_data=(val_X, val_Y), callbacks=[MetricsCallback()])

model.save('./EcommerceEssense/chatbot_model1.keras')

# Calculate final metrics
val_predictions = np.argmax(model.predict(val_X), axis=1)
val_true = np.argmax(val_Y, axis=1)

precision = precision_score(val_true, val_predictions, average='weighted')
recall = recall_score(val_true, val_predictions, average='weighted')
f1 = f1_score(val_true, val_predictions, average='weighted')
accuracy = hist.history['val_accuracy'][-1]

# Create a summary DataFrame
summary_data = {
    'Metric': ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
    'Value': [accuracy, precision, recall, f1]
}
summary_df = pd.DataFrame(summary_data)

# Save summary to CSV
summary_df.to_csv('./EcommerceEssense/model_summary.csv', index=False)

print("Training completed. Metrics saved to:")
print(f"- Epoch-wise metrics: {csv_file}")
print(f"- Model summary: ./EcommerceEssense/model_summary.csv")