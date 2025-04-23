import requests
import json
import os
import sys
from jinja2 import Template

SERVER_URL = "http://localhost:5001/chat"

def load_prompt_from_json(json_file):
    """Load prompt from JSON file"""
    try:
        with open(json_file, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data.get("customPrompt", "")
    except Exception as e:
        print(f"Error loading prompt from JSON: {e}")
        return None

def render_template(template_file, response_data):
    """Render HTML template using Jinja2 based on the response data"""
    try:
        with open(template_file, "r", encoding="utf-8") as file:
            template_content = file.read()
        
        template = Template(template_content)
        template_file_name = os.path.basename(template_file)
        
        # Determine which template we're rendering and provide appropriate data
        if template_file_name == "index.html":
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
        elif template_file_name == "menu.html":
            rendered_html = template.render(website=response_data["website"])
        elif template_file_name == "aboutUs.html":
            rendered_html = template.render(aboutPage=response_data["website"]["aboutPage"])
        elif template_file_name == "contact.html":
            rendered_html = template.render(contactPage=response_data["website"]["contactPage"])
        else:
            print(f"Error: Unsupported template file '{template_file_name}'.")
            return None
            
        # Save rendered HTML
        output_file = f"rendered_{template_file_name}"
        with open(output_file, "w", encoding="utf-8") as file:
            file.write(rendered_html)
            
        return rendered_html
        
    except Exception as e:
        print(f"Error rendering template: {e}")
        return None
        
def process_prompt(prompt, template_file):
    """Process a single prompt and render template"""
    try:
        response = requests.post(
            SERVER_URL,
            json={'prompt': prompt},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Handle case where response might be stringified JSON
            if isinstance(data, str):
                data = json.loads(data)
            
            # Print the full response for debugging
            print("Full response from server:")
            print(json.dumps(data, indent=2))
            
            # Extract just the response portion
            if 'response' in data:
                response_data = data['response']
                print("\nUsing response data:")
                print(json.dumps(response_data, indent=2))
                
                # Render template with just the response data
                rendered_html = render_template(template_file, response_data)
                
                print("\nTemplate rendered successfully!")
                print(f"Output saved to: rendered_{os.path.basename(template_file)}")
                return rendered_html
            else:
                print("Error: 'response' field not found in server response")
                return None
            
        print(f"Error: {response.text}")
        return None
    
    except requests.exceptions.RequestException as e:
        print(f"Connection error: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python client.py <template_file>")
        print("Example: python client.py index.html")
        sys.exit(1)
    
    template_file = sys.argv[1]
    prompt_file = "prompt.json"  
    
    if not os.path.exists(template_file):
        print(f"Error: Template file '{template_file}' not found.")
        sys.exit(1)
    
    if not os.path.exists(prompt_file):
        print(f"Error: Prompt file '{prompt_file}' not found.")
        sys.exit(1)
    
    # Load prompt from JSON file
    prompt = load_prompt_from_json(prompt_file)
    if not prompt:
        print("Error: Could not load prompt from JSON file")
        sys.exit(1)
    
    print(f"Using template: {template_file}")
    print(f"Using prompt from JSON: {prompt}")
    
    result = process_prompt(prompt, template_file)
    
    if result:
        print("\nOperation completed successfully!")
    else:
        print("\nOperation failed.")