import sys
import json
import requests
from jinja2 import Environment, FileSystemLoader
import os
from datetime import datetime

def get_chatbot_response(prompt):
    try:
        project_type = "portfolio"
        payload = {
            "prompt": prompt,
            "type": project_type
        }
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(
            "http://localhost:5001/chat", 
            data=json.dumps(payload), 
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        return {"error": f"Chatbot API failed with status {response.status_code}"}
    
    except Exception as e:
        return {"error": f"Chatbot API connection error: {str(e)}"}

def safe_get(dictionary, keys, default=None):
    """Safely get nested dictionary keys"""
    current = dictionary
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default
    return current

def render_template(template_file, response_data, page_name):
    try:
        # Create output directory
        output_dir = "rendered_templates"
        os.makedirs(output_dir, exist_ok=True)

        # Set up template environment with proper loader
        template_dir = os.path.join(os.path.dirname(__file__), "PortfolioTemplate")
        env = Environment(loader=FileSystemLoader(template_dir))
        
        # Add 'now' to the global environment
        env.globals['now'] = datetime.now
        
        # Check if template exists
        template_path = os.path.join(template_dir, template_file)
        if not os.path.exists(template_path):
            return {"error": f"Template file not found at {template_path}"}

        # Get the template
        template = env.get_template(template_file)

        if 'response' not in response_data:
            return {"error": "Invalid response format from chatbot API"}
            
        portfolio_data = response_data['response']['portfolio']
        
        # Prepare template variables with safe defaults
        template_vars = {
            'portfolio': portfolio_data,
            'meta': portfolio_data.get('meta', {}),
            'header': portfolio_data.get('header', {}),
            'footer': portfolio_data.get('footer', {}),
            'current_year': datetime.now().year
        }

        # Add page-specific content with safe navigation
        if template_file == "index.html":
            home_data = safe_get(portfolio_data, ['pages', 'home'], {})
            template_vars.update({
                'homepage': home_data,
                'hero': safe_get(home_data, ['hero'], {}),
                'services': safe_get(home_data, ['services'], None),
                'projects': safe_get(home_data, ['projects'], None),
                'expertise': safe_get(home_data, ['expertise'], None),
                'skills': safe_get(home_data, ['skills'], None),
                'clients': safe_get(home_data, ['clients'], None),
                'testimonials': safe_get(home_data, ['testimonials'], None),
                'about': safe_get(home_data, ['about'], None),
                'cta': safe_get(home_data, ['cta'], None)
            })
        elif template_file == "blog.html":
            template_vars['blog'] = safe_get(portfolio_data, ['pages', 'blog'], {})
        elif template_file == "aboutus.html":
            template_vars['about'] = safe_get(portfolio_data, ['pages', 'about'], {})
        elif template_file == "project.html":
            template_vars['projects'] = safe_get(portfolio_data, ['pages', 'projects'], {})
        else:
            return {"error": f"Unsupported template file '{template_file}'"}

        # Render template
        rendered_html = template.render(**template_vars)

        # Save output
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