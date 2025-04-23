import sys
import json
import requests
from jinja2 import Environment, FileSystemLoader, select_autoescape
import os
from datetime import datetime

def get_chatbot_response(prompt):
    try:
        project_type = "blog"
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
        template_dir = os.path.join(os.path.dirname(__file__), "BlogTemplates")
        template_path = os.path.join(template_dir, template_file)
        
        if not os.path.exists(template_dir):
            return {"error": f"Template directory not found at {template_dir}"}
        if not os.path.exists(template_path):
            return {"error": f"Template file not found at {template_path}"}

        # Set up Jinja2 environment with additional features
        env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(['html', 'xml']),
            extensions=['jinja2.ext.loopcontrols']  # Add extensions for cycle tag
        )

        # Load the template
        template = env.get_template(template_file)

        # Process the response data
        if 'response' not in response_data:
            return {"error": "Invalid response format from chatbot API"}
            
        response_data = response_data['response']
        website_data = response_data["website"]

        # Common template variables
        template_vars = {
            "website": website_data,
            "meta": website_data.get("meta", {}),
            "header": website_data.get("header", {}),
            "footer": website_data.get("footer", {}),
            "styles": website_data.get("styles", {}),
            "scripts": website_data.get("scripts", [])
        }

        # Add page-specific content
        if "homepage" in template_file.lower():
            template_vars.update({
                "homepage": website_data["pages"]["homepage"]
            })
        elif "about" in template_file.lower():
            template_vars.update({
                "about": website_data["pages"]["about"]
            })
        elif "blog" in template_file.lower():
            template_vars.update({
                "blog": website_data["pages"]["blog"]
            })
        elif "contact" in template_file.lower():
            template_vars.update({
                "contact": website_data["pages"]["contact"]
            })
        elif "single_post" in template_file.lower():
            template_vars.update({
                "single_post": website_data["pages"]["single_post"]
            })

        # Render the template
        rendered_html = template.render(**template_vars)
        
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
        
        # Print the result
        print(json.dumps(result, indent=2))
        
        # Exit with proper status code
        sys.exit(0 if "error" not in result else 1)

    except Exception as e:
        error_result = {"error": f"Unexpected error: {str(e)}"}
        print(json.dumps(error_result))
        sys.exit(1)