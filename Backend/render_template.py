import sys
import json
import requests
from jinja2 import Template
import os
from datetime import datetime

def get_chatbot_response(prompt):
    try:
        payload = {"prompt": prompt}
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(
            "http://localhost:5001/chat", 
            data=json.dumps(payload), 
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": "Failed to get response from chatbot"}
    
    except Exception as e:
        return {"error": str(e)}

def render_template(template_file, response_data):
    try:
        # Create output directory if it doesn't exist
        output_dir = "rendered_templates"
        os.makedirs(output_dir, exist_ok=True)
        
        # Load the Jinja2 template
        with open(f"templates/{template_file}", "r", encoding="utf-8") as file:
            template_content = file.read()

        # Create a Jinja2 template object
        response_data = response_data['response']
        template = Template(template_content)

        # Extract data based on the template file name
        if template_file == "index.html":
            # Handle both 'collections' and 'specials' cases
            index_page = response_data["website"]["indexPage"]
            
            # Determine which key exists for the specials/collections section
            if "collections" in index_page:
                section_data = index_page["collections"]
                section_title = section_data.get("title", "Shop by Category")
                # Handle both 'categories' and 'menu_items'
                items = section_data.get("categories", section_data.get("menu_items", []))
            elif "specials" in index_page:
                section_data = index_page["specials"]
                section_title = section_data.get("title", "Special Offers")
                items = section_data.get("menu_items", section_data.get("categories", []))
            else:
                section_title = "Featured Items"
                items = []
            
            rendered_html = template.render(
                title=response_data["website"]["title"],
                stylesheets=response_data["website"]["stylesheets"],
                navbar=response_data["website"]["navbar"],
                carousel=response_data["website"]["indexPage"]["carousel"],
                specials={
                    "title": section_title,
                    "menu_items": items
                },
                highlights=response_data["website"]["indexPage"].get("highlights", []),
                testimonials=response_data["website"]["indexPage"].get("testimonials", []),
                gallery=response_data["website"]["indexPage"].get("gallery", []),
                footer=response_data["website"]["contactPage"]["footer"]
            )
        
        elif template_file == "shop.html":
            rendered_html = template.render(website=response_data["website"])
        
        elif template_file == "aboutUs.html":
            rendered_html = template.render(aboutPage=response_data["website"]["aboutPage"])
        
        elif template_file == "contact.html":
            rendered_html = template.render(contactPage=response_data["website"]["contactPage"])
        
        else:
            return {"error": f"Unsupported template file '{template_file}'."}

        # Generate timestamp for unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"{output_dir}/rendered_{template_file}"
        
        # Save the rendered HTML to file
        with open(output_filename, "w", encoding="utf-8") as file:
            file.write(rendered_html)
        
        return {
            "original_response": response_data,
            "rendered_html": rendered_html,
            "template_used": template_file,
            "saved_file": output_filename,
            "file_path": os.path.abspath(output_filename)
        }

    except Exception as e:
        return {"error": f"Template rendering error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Prompt and template file are required"}))
        sys.exit(1)
    
    prompt = sys.argv[1]
    template_file = sys.argv[2]
    
    # Get response from chatbot
    response_data = get_chatbot_response(prompt)
    
    if "error" in response_data:
        print(json.dumps(response_data))
        sys.exit(1)
    
    # Render template with the response data
    result = render_template(template_file, response_data)
    print(json.dumps(result, indent=2))