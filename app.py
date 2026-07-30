import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# User can set API key in .env OR directly below:
# GEMINI_API_KEY = "your_actual_api_key_here"
API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Available Gemini Models list (Tested & Verified with active key)
AVAILABLE_MODELS = [
    {
        "id": "gemini-3.6-flash",
        "name": "Gemini 3.6 Flash",
        "description": "Next-gen ultra-fast & intelligent model",
        "recommended": True
    },
    {
        "id": "gemini-3.5-flash",
        "name": "Gemini 3.5 Flash",
        "description": "High performance multimodal model"
    },
    {
        "id": "gemini-3.1-flash-lite",
        "name": "Gemini 3.1 Flash Lite",
        "description": "Lightweight & responsive model"
    },
    {
        "id": "gemini-flash-latest",
        "name": "Gemini Flash Latest",
        "description": "Latest stable Gemini Flash build"
    },
    {
        "id": "gemini-3-flash-preview",
        "name": "Gemini 3 Flash Preview",
        "description": "Experimental preview model"
    }
]

def get_genai_client():
    """Returns configured google-generativeai module if API key is present."""
    key = os.getenv("GEMINI_API_KEY", API_KEY).strip().strip('"').strip("'")
    if not key or key == "YOUR_GEMINI_API_KEY_HERE":
        return None, "API Key missing. Please enter your GEMINI_API_KEY in .env file or app.py."
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=key)
        return genai, None
    except Exception as e:
        return None, f"Failed to initialize Google Generative AI client: {str(e)}"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("favicon.svg")

@app.route("/api/models", methods=["GET"])
def get_models():
    key = os.getenv("GEMINI_API_KEY", API_KEY).strip()
    is_key_set = bool(key and key != "YOUR_GEMINI_API_KEY_HERE")
    return jsonify({
        "models": AVAILABLE_MODELS,
        "is_configured": is_key_set,
        "active_key_source": ".env / app.py"
    })

@app.route("/api/chat", methods=["POST"])
def chat():
    genai, err = get_genai_client()
    if err:
        return jsonify({
            "success": False,
            "error": err,
            "code": "MISSING_KEY"
        }), 400

    data = request.json or {}
    user_message = data.get("message", "").strip()
    selected_model = data.get("model", "gemini-3.6-flash")
    history = data.get("history", [])

    if not user_message:
        return jsonify({"success": False, "error": "Message content cannot be empty."}), 400

    # Ensure model ID is valid, fallback to gemini-3.6-flash
    valid_ids = [m["id"] for m in AVAILABLE_MODELS]
    if selected_model not in valid_ids:
        selected_model = "gemini-3.6-flash"

    try:
        # Prepare Generative Model instance
        model_instance = genai.GenerativeModel(selected_model)
        
        # Build multi-turn chat history format for google.generativeai
        formatted_history = []
        for turn in history:
            role = turn.get("role")
            content = turn.get("content")
            if role in ["user", "model", "assistant"] and content:
                # Map assistant role to model for SDK
                genai_role = "model" if role in ["assistant", "model"] else "user"
                formatted_history.append({
                    "role": genai_role,
                    "parts": [content]
                })

        # Start chat session with formatted history
        chat_session = model_instance.start_chat(history=formatted_history)
        response = chat_session.send_message(user_message)
        
        reply_text = response.text if hasattr(response, 'text') else str(response)

        return jsonify({
            "success": True,
            "reply": reply_text,
            "model_used": selected_model
        })

    except Exception as e:
        error_str = str(e)
        # Attempt fallback to gemini-3.6-flash if model-specific API error occurs
        if "404" in error_str or "not found" in error_str.lower():
            try:
                fallback_instance = genai.GenerativeModel("gemini-3.6-flash")
                fallback_resp = fallback_instance.generate_content(user_message)
                return jsonify({
                    "success": True,
                    "reply": fallback_resp.text,
                    "model_used": "gemini-3.6-flash (fallback)"
                })
            except Exception as fallback_err:
                error_str = f"{error_str} | Fallback failed: {str(fallback_err)}"

        return jsonify({
            "success": False,
            "error": f"Gemini API Error: {error_str}",
            "code": "API_ERROR"
        }), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
