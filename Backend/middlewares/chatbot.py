import sys
import json
import requests
from jinja2 import Template
import os
from datetime import datetime

def get_chatbot_response(prompt):
    try:
        project_type = "ecommerce"
        payload = {
            "prompt": prompt,
            "type": project_type  # Add project type to payload
        }
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(
            "http://localhost:5001/chat", 
            data=json.dumps(payload), 
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"Chatbot API failed with status {response.status_code}"}
    
    except Exception as e:
        return {"error": f"Chatbot API connection error: {str(e)}"}

def render_template(template_file, response_data, page_name):
    try:
        # Create output directory if it doesn't exist
        output_dir = "rendered_templates"
        os.makedirs(output_dir, exist_ok=True)

        # Construct proper template path
        template_dir = os.path.join(os.path.dirname(__file__), "templates")
        template_path = os.path.join(template_dir, template_file)
        
        if not os.path.exists(template_path):
            return {"error": f"Template file not found at {template_path}"}

        # Load the template
        with open(template_path, "r", encoding="utf-8") as file:
            template_content = file.read()

        # Process the response data
        if 'response' not in response_data:
            return {"error": "Invalid response format from chatbot API"}
            
        response_data = response_data['response']
        template = Template(template_content)

            # Template-specific rendering logic
        if template_file == "index.html":
            # Handle both cases for categories data
            categories_data = (
                response_data["website"]["indexPage"].get("collections", {}).get("categories") or 
                response_data["website"]["indexPage"].get("specials", {}).get("menu_items")
            )
            
            rendered_html = template.render(
                title=response_data["website"]["title"],
                stylesheets=response_data["website"]["stylesheets"],
                navbar=response_data["website"]["navbar"],
                carousel=response_data["website"]["indexPage"]["carousel"],
                specials={
                    "title": "Shop by Category",
                    "menu_items": categories_data
                },
                highlights=response_data["website"]["indexPage"]["highlights"],
                testimonials=response_data["website"]["indexPage"]["testimonials"],
                gallery=response_data["website"]["indexPage"]["gallery"],
                footer=response_data["website"]["contactPage"]["footer"]
            )
        elif template_file == "menu.html":
            rendered_html = template.render(website=response_data["website"])
        elif template_file == "aboutUs.html":
            rendered_html = template.render(aboutPage=response_data["website"]["aboutPage"])
        elif template_file == "contact.html":
            rendered_html = template.render(contactPage=response_data["website"]["contactPage"])
        else:
            return {"error": f"Unsupported template file '{template_file}'"}

        # Save the rendered output
        output_filename = f"rendered_{page_name}.html"
        output_path = os.path.join(output_dir, output_filename)
        
        with open(output_path, "w", encoding="utf-8") as file:
            file.write(rendered_html)
        
        return {
            "status": "success",
            "output_file": output_path,
            "template_used": template_file
        }

    except Exception as e:
        return {"error": f"Template rendering error: {str(e)}"}

if __name__ == "__main__":
    try:
        if len(sys.argv) < 4:
            result = {"error": "Prompt, template file and page name are required"}
            print(json.dumps(result))
            sys.exit(1)
        
        prompt = sys.argv[1]
        template_file = sys.argv[2]
        page_name = sys.argv[3]
        
        # Get response from chatbot
        response_data = get_chatbot_response(prompt)
        
        if "error" in response_data:
            print(json.dumps(response_data))
            sys.exit(1)
        
        # Render template with the response data
        result = render_template(template_file, response_data, page_name)
        
        # Print the result (Node.js will capture this)
        print(json.dumps(result, indent=2))
        
        # Exit with proper status code
        sys.exit(0 if "error" not in result else 1)

    except Exception as e:
        error_result = {"error": f"Unexpected error: {str(e)}"}
        print(json.dumps(error_result))
        sys.exit(1)