const API_URL = "https://credit-card-chatbot-production.up.railway.app";

export async function sendMessage(message) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return await res.json();
}

export async function compareCards(card_names) {
  const res = await fetch(`${API_URL}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card_names }),
  });
  return await res.json();
}