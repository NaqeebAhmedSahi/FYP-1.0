import json
import sys
from jinja2 import Template

# Ensure the script receives a file path argument
if len(sys.argv) < 2:
    print("Error: No file path provided. Usage: python script.py <template_file>")
    sys.exit(1)

# Get the template file from the command-line argument
template_file = sys.argv[1]

# Load the JSON data
with open("1.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Extract the first response from the first intent
if data.get("intents"):
    first_intent = data["intents"][0]
    if first_intent.get("response"):
        response_data = first_intent["response"][0]

# Load the Jinja2 template
with open(template_file, "r", encoding="utf-8") as file:
    template_content = file.read()

# Create a Jinja2 template object
template = Template(template_content)

# Extract data based on the template file
if template_file == "index.html":
    # Data for index.html
    rendered_html = template.render(
        title=response_data["website"]["title"],
        stylesheets=response_data["website"]["stylesheets"],
        navbar=response_data["website"]["navbar"],
        carousel=response_data["website"]["indexPage"]["carousel"],
        specials={
            "title": "Shop by Category",
            "menu_items": response_data["website"]["indexPage"]["collections"]["categories"]
        },
        highlights=response_data["website"]["indexPage"]["highlights"],
        testimonials=response_data["website"]["indexPage"]["testimonials"],
        gallery=response_data["website"]["indexPage"]["gallery"],
        footer=response_data["website"]["contactPage"]["footer"]
    )
elif template_file == "menu.html":
    # Data for menu.html
    # Pass the entire website object to the template
    rendered_html = template.render(website=response_data["website"])
else:
    print(f"Error: Unsupported template file '{template_file}'.")
    sys.exit(1)

# Save the rendered HTML to a new file
output_file = f"rendered_{template_file}"
with open(output_file, "w", encoding="utf-8") as file:
    file.write(rendered_html)

print(f"HTML file generated successfully: {output_file}")