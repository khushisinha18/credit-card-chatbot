import { useState, useEffect, useRef } from "react";
import { sendMessage, compareCards } from "./api";
import Card from "./Card";

// Helper: Parse cards from a plain text bot message (improved parser)
function parseCardsFromText(text) {
  // Improved parser: supports both numbered and bulleted lists, and flexible formats
  const cardBlocks = text.split(/\n\s*\d+\.|\n\s*- /).filter(Boolean);
  const cards = [];
  cardBlocks.forEach(block => {
    // Try to extract fields using regex or string search
    const nameMatch = block.match(/([A-Za-z0-9\s]+) Issuer:/) || block.match(/^([A-Za-z0-9\s]+)\s*\n/);
    const issuerMatch = block.match(/Issuer: ([^\n<]+)/);
    const imageMatch = block.match(/Image: ([^\s>]+)/);
    const perksMatch = block.match(/Perks: ([^\[]+)/);
    const applyUrlMatch = block.match(/\[Apply Now\]\(([^)]+)\)/);
    cards.push({
      name: nameMatch ? nameMatch[1].trim() : 'Card',
      issuer: issuerMatch ? issuerMatch[1].trim() : '',
      image: imageMatch ? imageMatch[1].trim() : 'https://dummyimage.com/credit-card',
      perks: perksMatch ? perksMatch[1].trim() : '',
      applyUrl: applyUrlMatch ? applyUrlMatch[1].trim() : '#'
    });
  });
  // Filter out empty/invalid cards
  return cards.filter(c => c.name && c.issuer);
}

// Helper: Detect if a message is an onboarding/info-gathering prompt
function isInfoPrompt(text) {
  return (
    text &&
    (
      text.includes("I'll need a bit more information") ||
      text.includes("Could you please share your monthly income") ||
      text.includes("To provide the best recommendations, I'll need to know your spending habits") ||
      text.includes("Ready to get started? Just let me know!")
    )
  );
}

// Helper: Render info prompt in a modern, friendly info card
function renderInfoPrompt(msg, i) {
  return (
    <div key={i} className="flex justify-center">
      <div className="flex flex-col items-center bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 rounded-2xl shadow-lg px-8 py-10 max-w-xl w-full">
        <div className="mb-4">
          <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#e0e7ff"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <div className="text-2xl font-bold text-indigo-700 mb-2 font-sans">Welcome to FinMate!</div>
        <div className="text-base text-gray-700 font-sans leading-relaxed mb-4 text-center">
          Let's find your perfect credit card. To get started, please share:
        </div>
        <ul className="list-disc list-inside text-indigo-700 text-base mb-4 text-left w-full max-w-md mx-auto">
          <li><span className="font-semibold">Monthly income</span></li>
          <li><span className="font-semibold">Spending habits</span> (e.g., fuel, travel, groceries)</li>
          <li><span className="font-semibold">Desired benefits</span> (e.g., cashback, lounge access, travel rewards)</li>
        </ul>
        <div className="text-base text-gray-600 font-sans mb-2 text-center">
          Not sure about your preferences? No worries! I can explain the benefits of different cards and help you decide.
        </div>
        <div className="text-indigo-500 font-medium text-center">
          Ready? Just type your details below to get started!
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [compareResult, setCompareResult] = useState(null);
  const [loading, setLoading] = useState(false); // <-- Add loading state here
  const [selectedCards, setSelectedCards] = useState([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [infoStep, setInfoStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ income: '', spending: '', benefits: '' });

  // Remove hardcoded onboarding flow, let agent handle all onboarding/questions
  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    setLoading(true);
    try {
      // Always send user input to backend agent, let it decide what to ask next
      const res = await sendMessage(input);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: res.response.output
        },
        ...(res.response.cards && res.response.cards.length > 0
          ? [{
              from: "bot",
              type: "recommendations",
              cards: res.response.cards
            }]
          : [])
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (cardName) => {
    const selected = messages
      .flatMap((msg) => (msg.cards ? msg.cards.map((c) => c.name) : []))
      .filter((name) => name === cardName);

    if (selected.length > 0) {
      const result = await compareCards([cardName]);
      setCompareResult(result.cards);
    }
  };

  const handleSelect = (cardName) => {
    setSelectedCards((prev) =>
      prev.includes(cardName)
        ? prev.filter((name) => name !== cardName)
        : [...prev, cardName]
    );
  };

  const handleCompareSelected = async () => {
    const result = await compareCards(selectedCards);
    setCompareResult(result.cards || result);
  };

  // Helper: Render fallback card recommendations from plain text (improved UI)
  function renderTextRecommendations(msg, i) {
    const cards = parseCardsFromText(msg.text);
    if (!cards.length) {
      // fallback: just render the text as a styled bot message
      return (
        <div key={i} className="flex justify-start">
          <div className="bg-indigo-50 px-5 py-3 rounded-2xl max-w-[75%] text-base shadow border border-indigo-200 break-words font-sans leading-relaxed text-indigo-800">
            {msg.text}
          </div>
        </div>
      );
    }
    return (
      <div key={i} className="flex flex-col gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`flex flex-col bg-white rounded-2xl shadow-lg border border-indigo-100 p-5 transition hover:shadow-xl ${
                selectedCards.includes(card.name) ? "ring-2 ring-indigo-400" : ""
              }`}
              onClick={() => handleSelect(card.name)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={card.image}
                alt={card.name}
                className="h-20 w-auto object-contain mx-auto mb-3 rounded bg-indigo-50"
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-indigo-700 mb-1 font-sans">{card.name}</h2>
                <div className="text-sm text-gray-500 mb-2 font-medium">{card.issuer}</div>
                {card.perks && (
                  <div className="text-gray-700 text-sm mb-3 font-sans">
                    <span className="font-semibold text-indigo-600">Perks: </span>{card.perks}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-auto">
                {/* Remove Apply button, keep only Compare */}
                <button
                  className="bg-white border border-indigo-400 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-indigo-50 transition"
                  onClick={e => {
                    e.stopPropagation();
                    handleCompareSelected([card.name]);
                  }}
                >
                  Compare
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-gray-600 text-base mt-2 font-sans px-2">
          Would you like to see more options or compare these cards further?
        </div>
      </div>
    );
  }

  // Memory refresh: clear chat after 30 minutes of inactivity
  const lastActivityRef = useRef(Date.now());
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 30 * 60 * 1000) {
        setMessages([]);
        setCompareResult(null);
        setSelectedCards([]);
      }
    }, 60 * 1000);
    return () => {
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 w-full bg-white shadow-md py-4 px-6 flex items-center gap-2 mb-2">
        <img src="https://img.icons8.com/color/48/credit-card.png" alt="Credit Card" className="h-8 w-8" />
        <h1 className="text-xl font-bold text-indigo-700 tracking-tight">Credit Card Recommendation Chatbot</h1>
      </header>

      {/* Chat Container */}
      <div className="flex-1 w-full flex justify-center">
        <div className="relative flex flex-col w-full max-w-2xl h-[80vh] bg-white/80 rounded-3xl shadow-xl border border-indigo-100 mt-4 mb-6 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
            {messages.map((msg, i) =>
              msg.from === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-3 rounded-2xl max-w-[75%] text-base shadow-md border border-indigo-200 break-words font-sans">
                    {msg.text}
                  </div>
                </div>
              ) : msg.from === "bot" && !msg.type ? (
                isInfoPrompt(msg.text)
                  ? renderInfoPrompt(msg, i)
                  : renderTextRecommendations(msg, i)
              ) : msg.type === "recommendations" ? (
                <div key={i} className="grid md:grid-cols-2 gap-6 bg-indigo-50 rounded-xl p-4 shadow-inner border border-indigo-100">
                  {msg.cards.map((card, idx) => (
                    <Card
                      key={idx}
                      card={card}
                      isSelected={selectedCards.includes(card.name)}
                      onToggleSelect={() => handleSelect(card.name)}
                    />
                  ))}
                </div>
              ) : null
            )}

            {/* Show loading spinner */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-base animate-pulse shadow">
                  Typing...
                </div>
              </div>
            )}

            {/* Comparison Result */}
            {compareResult && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow mt-4">
                <h3 className="font-bold mb-2 text-yellow-800">Comparison Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(compareResult, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Compare Selected button */}
          {selectedCards.length > 0 && (
            <div className="absolute -top-8 right-6 z-30">
              <button
                onClick={handleCompareSelected}
                className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Compare Selected ({selectedCards.length})
              </button>
            </div>
          )}

          {/* Input area */}
          <div className="w-full px-4 py-4 border-t bg-white flex gap-3 items-center shadow-inner z-10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-300 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base shadow"
              placeholder="Type your message..."
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}