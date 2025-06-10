export async function sendMessage(message) {
  const res = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return await res.json();
}

export async function compareCards(card_names) {
  const res = await fetch("http://localhost:8000/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card_names }),
  });
  return await res.json();
}