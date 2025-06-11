import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import StructuredTool
from pydantic.v1 import BaseModel, Field
from recommend import recommend_cards, compare_cards_by_name
from typing import List

# === Load .env ===
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
api_base = os.getenv("OPENAI_API_BASE")
print("API KEY:", api_key)
print("API BASE:", api_base)
# === Load .env === 
api_key = os.getenv("OPENAI_API_KEY")
api_base = os.getenv("OPENAI_API_BASE")

# === LLM Setup (OpenRouter) ===
llm = ChatOpenAI(
    temperature=0.7,
    model="mistralai/mistral-7b-instruct:free",
    openai_api_key=api_key,
    openai_api_base=api_base
)

# === Memory ===
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# === Input schema ===
class UserProfile(BaseModel):
    income: int = Field(description="Monthly income in INR")
    habits: list[str] = Field(description="Spending habits like fuel, travel, groceries")
    benefits: list[str] = Field(description="Preferred card benefits like cashback, lounge access, etc.")

class CompareRequest(BaseModel):
    card_names: List[str]

class ChatRequest(BaseModel):
    message: str

# === Recommendation tool ===
def recommend_tool_func(income: int, habits: list[str], benefits: list[str]) -> dict:
    profile = {"income": income, "habits": habits, "benefits": benefits}
    results = recommend_cards(profile)

    if not results:
        return {"type": "text", "content": "No matching cards found."}

    return {
        "type": "recommendations",
        "cards": [
            {
                "name": r["name"],
                "issuer": r["issuer"],
                "reason": r["reason"],
                "image": r.get("image_url", "https://via.placeholder.com/150"),
                # No link field, no Apply Now
            }
            for r in results
        ]
    }

tools = [
    StructuredTool.from_function(
        name="CreditCardRecommender",
        description="Recommend credit cards based on income, spending habits, and preferred benefits.",
        func=recommend_tool_func,
        args_schema=UserProfile
    )
]

# === Custom system prompt ===
prompt = ChatPromptTemplate.from_messages([
    ("system", """
You are FinMate, a friendly, smart assistant that helps users find the best credit card.

How to respond:
- Never show raw JSON to the user.
- Present recommendations in clear, conversational language.
- For each recommended card, describe it as if it will be shown in a visual card (div) on the screen, with:
  - Card image (show the image URL)
  - Card name (as a title)
  - Issuer (bank or provider)
  - Perks or why it fits the user (short, friendly explanation)
  - Two clear actions: "Apply Now" (with the link) and "Compare" (with the card name)
- Do not use markdown or code blocks. Just describe each card as a user-friendly summary, as if it will be rendered in a UI card component.
- Use a warm, supportive tone. Be conversational, not robotic.
- After presenting cards, invite the user to ask for more options or compare cards.

Example output for one card:

Card: HDFC Regalia  
Issuer: HDFC Bank  
Image: https://...  
Perks: Great for travel and lounge access on a mid-tier income.  
[Apply Now](https://...) | [Compare HDFC Regalia]

If multiple cards, describe each in this format, one after another.

If not enough info is provided, thank the user for what they shared and ask for ALL missing details in a single, friendly message.
"""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

# === Agent config ===
agent = create_tool_calling_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    memory=memory,
    verbose=True
)

# === FastAPI setup ===
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (needed because each Vercel preview has a unique URL)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/compare")
async def compare_cards(body: CompareRequest):
    names = body.card_names
    if not names:
        return {"error": "No card names provided."}
    return {"cards": compare_cards_by_name(names)}

@app.post("/chat")
async def chat(body: ChatRequest):
    user_input = body.message
    # Reset memory if user says 'reset' or 'start over'
    if user_input.strip().lower() in ["reset", "start over", "restart", "clear"]:
        memory.clear()
        return {"response": {"output": "Memory cleared! Let's start fresh. Hi! 👋 I'm FinMate, your credit card assistant. What's your monthly income?"}}
    result = agent_executor.invoke({"input": user_input})
    # If result is a dict with "output", return as is
    if isinstance(result, dict) and "output" in result:
        return {"response": {"output": result["output"]}}
    # If result is just a string, wrap it
    return {"response": {"output": result}}