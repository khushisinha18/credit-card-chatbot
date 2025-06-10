export default function Card({ card, isSelected, onToggleSelect, onCompare }) {
  return (
    <div
      className={`flex flex-col bg-white rounded-3xl shadow-xl border border-indigo-200 p-6 transition hover:shadow-2xl ${
        isSelected ? "ring-2 ring-indigo-500" : ""
      }`}
      style={{ cursor: "pointer", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
      onClick={onToggleSelect}
    >
      <img
        src={card.image || card.image_url}
        alt={card.name}
        className="h-24 w-auto object-contain mx-auto mb-4 rounded-xl bg-indigo-50"
      />
      <div className="flex-1 w-full">
        <h2 className="text-xl font-extrabold text-indigo-800 mb-1 tracking-tight">{card.name}</h2>
        <div className="text-sm text-indigo-500 mb-2 font-semibold">{card.issuer}</div>
        <div className="text-gray-700 text-base mb-4 leading-relaxed">
          {card.perks || card.reason}
        </div>
      </div>
      <div className="flex gap-3 mt-auto items-center">
        <a
          href={card.link || card.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow hover:scale-105 transition-transform hover:from-indigo-600 hover:to-purple-600"
          onClick={e => e.stopPropagation()}
        >
          Apply
        </a>
        <button
          className="bg-white border border-indigo-400 text-indigo-700 px-5 py-2 rounded-full text-sm font-bold shadow hover:bg-indigo-50 transition"
          onClick={e => {
            e.stopPropagation();
            if (onCompare) onCompare(card.name);
          }}
        >
          Compare
        </button>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 text-indigo-600 ml-auto accent-indigo-500"
          onClick={e => e.stopPropagation()}
          aria-label="Select card"
        />
      </div>
    </div>
  );
}