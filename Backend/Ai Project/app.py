from flask import Flask, render_template
import json

app = Flask(__name__, template_folder='.')
chatbot_response = None  # Declare chatbot_response as a global variable

def display_response():
    global chatbot_response
    try:
        # Read the result from the file
        with open("chatbot_result.json", "r") as file:
            chatbot_response = file.read().strip()
        print("Received response from chatbot: ", chatbot_response)
        # Assuming chatbot_response is a JSON string, convert it to a dictionary
        chatbot_response = json.loads(chatbot_response)
    except FileNotFoundError:
        print("No response file found.")
        chatbot_response = None

@app.route('/index.html')
def index():
    display_response()
    return render_template('website/index.html', response=chatbot_response)

@app.route('/company.html')
def company():
    display_response()
    return render_template('website/company.html', response=chatbot_response)

@app.route('/car.html')
def car():
    display_response()
    return render_template('website/car.html', response=chatbot_response)

@app.route('/contact.html')
def contact():
    display_response()
    return render_template('website/contact.html', response=chatbot_response)

@app.route('/order.html')
def order():
    display_response()
    return render_template('website/order.html', response=chatbot_response)

if __name__ == '__main__':
    app.run(debug=True)
