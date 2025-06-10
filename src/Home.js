import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to FinMate</h1>
        <button
          onClick={() => navigate("/chat")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Start Chat
        </button>
      </div>
    </div>
  );
}
