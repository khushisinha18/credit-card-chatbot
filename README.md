# 💳 FinMate – Credit-Card Recommendation Chatbot

## 🎥 Chatbot Demo Video

Check out a full walkthrough of the credit card recommendation chatbot:

▶️ [Watch the demo on Google Drive](https://drive.google.com/file/d/11j2EyJuwcLVynau3yyz0PjDiFC735baK/view?usp=sharing)

![Chatbot GIF Preview](docs/chatbot-demo.gif)

<p align="center">
  <img src="Screen Recording 2025-06-11 at 3.16.58 PM.gif" width="700" alt="FinMate demo">
</p>

---

## ✨ Why FinMate?

Finding the *right* credit card is confusing.  
FinMate chats with you, learns your income, spending habits & desired perks, and instantly recommends the top-matching cards.  
Built with **FastAPI + LangChain** on the backend and **React + Tailwind** on the frontend.

---

## 🧠 Agent Flow

```mermaid
flowchart TD
    A(User) -->|types message| B(React Frontend)
    B -->|POST /chat| C(FastAPI endpoint)
    C --> D(ConversationBufferMemory)
    D --> E(LangChain Tool-Calling Agent)
    E -->|needs more info?| B
    E -->|ready| F(CreditCardRecommender tool)
    F --> G(recommend_cards function)
    G --> H(cards.json)
    H --> G
    F --> E
    E --> C
    C -->|JSON response| B
    B -->|render cards + chat| A

---

## 🌐 Quick Links
| Resource | URL |
|----------|-----|
| Deployed frontend | **https://credit-card-chatbot-git-master-khushi-sinhas-projects.vercel.app** |
| Deployed backend (Swagger) | **https://faithful-gratitude-production-9fd1.up.railway.app/docs** |
| GitHub repo | **<repo-url>** |

---

## 🏗 Local Setup

> Prereqs: **Node ≥ 18** & **Python ≥ 3.11**

```bash
git clone <repo-url>
cd credit-card-chatbot

# 1️⃣  Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=<your-key>
uvicorn agent:app --reload        # localhost:8000/docs

# 2️⃣  Frontend (in new terminal)
cd ../credit-chatbot
npm install
npm start                         # localhost:3000
