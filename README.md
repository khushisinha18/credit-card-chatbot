# 💳 FinMate – Credit-Card Recommendation Chatbot

[Live Demo →](https://credit-card-chatbot-git-master-khushi-sinhas-projects.vercel.app)  
[Backend API →](https://faithful-gratitude-production-9fd1.up.railway.app/docs)

<p align="center">
  <img src="docs/demo.gif" width="700" alt="FinMate demo">
</p>

---

## ✨ Why FinMate?

Finding the *right* credit card is confusing.  
FinMate chats with you, learns your income, spending habits & desired perks, and instantly recommends the top-matching cards.  
Built with **FastAPI + LangChain** on the backend and **React + Tailwind** on the frontend.

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
