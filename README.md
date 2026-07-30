# 🤖 Gemini ChatBot - Basic Prototype Build

A modern, responsive, multi-turn AI chatbot application powered by **Google Gemini AI** and **Python Flask**. Built with a clean aesthetic featuring **Warm Beige**, **Soft Light Pink**, and **Rich Black Typography**.

---

## 🌐 Live Demonstration
Experience the live web application here:  
👉 **[https://chat-bot-prototype-alpha.vercel.app/](https://chat-bot-prototype-alpha.vercel.app/)**

---

## 🛠️ Tech Stack & Required Technologies

### 🎨 Frontend
- **HTML5**: Semantic web architecture & template layout.
- **CSS3**: Custom design system (Warm Beige `#FAF6F0`, Soft Light Pink `#F8D7DA`, Rich Black `#111111` typography).
- **JavaScript (ES6+)**: SPA logic, model switching state, copy-to-clipboard code blocks, and dynamic UI popovers.
- **Marked.js**: Markdown parsing for AI responses.
- **Highlight.js**: Code syntax highlighting.
- **FontAwesome 6**: Vector UI icons.
- **Google Fonts**: *Outfit* & *Plus Jakarta Sans*.

### ⚙️ Backend
- **Python 3**: Server logic & API endpoints.
- **Flask**: Lightweight Python web framework (`Flask>=3.0.0`).
- **Google Generative AI SDK**: `google-generativeai` package for multi-turn Gemini API interaction.
- **Python Dotenv**: `python-dotenv` for secure environment variable isolation.

---

## ✨ Features

- **Google Gemini Integration**: Supports `Gemini 3.6 Flash`, `Gemini 3.5 Flash`, `Gemini 3.1 Flash Lite`, `Gemini Flash Latest`, and `Gemini 3 Flash Preview`.
- **Collapsible Sidebar (`☰`)**: Clean drawer with quick model selection dropdown and capability cards.
- **Top Center Branding**: Logo emblem & `Basic Prototype Build` badge.
- **5 Pre-built Capability Presets**:
  - 📚 **Learning**: Conceptual breakdowns & study guides.
  - 💻 **Coding**: Code generation, debugging & refactoring.
  - 📝 **Assessment**: Practice quizzes & flashcards.
  - 🎨 **Creating**: Draft content, stories, Images, PPT & PDF documents.
  - 🛠️ **Tech & Dev**: Architecture blueprints & API specs.
- **Floating Input Capsule**: Responsive bottom chat bar with `+` action menu for document/code snippet attachment.

---

## 🚀 Quick Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/PavanReddy666/ChatBot-Prototype.git
cd ChatBot-Prototype
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory (copied from `.env.example`):
```bash
# In .env:
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Get your free API key at [Google AI Studio](https://aistudio.google.com/))*

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Launch Application
```bash
python app.py
```
Open your browser and navigate to **[http://127.0.0.1:5000](http://127.0.0.1:5000)**.

---

## 📁 Repository Structure

```
├── app.py              # Flask server & Gemini API integration
├── .env.example        # Environment variable template
├── .gitignore          # Excludes secret files (.env)
├── requirements.txt    # Python dependencies
├── static/
│   ├── favicon.svg     # Dark black & warm beige SVG logo
│   ├── css/style.css   # Custom Beige & Pink design system
│   └── js/main.js      # Chat engine & UI handlers
└── templates/
    └── index.html      # Single Page Application template
```

---

## 👤 Author & Developer
Built by **[Pavan Reddy](https://github.com/PavanReddy666)**
