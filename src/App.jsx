import { useState, useEffect } from "react";

function App() {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // History Sidebar open/close control
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("autoScriptHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    setScript("");

    try {
      // DHYAN DEIN: Yahan apna actual Vercel/Render backend URL hi rakhna
      const response = await fetch(
        "https://autoscript-backend-1.onrender.com/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setScript(data.script);

        const newItem = {
          id: Date.now(),
          topic: topic,
          generatedScript: data.script,
          createdAt: new Date().toISOString(),
        };

        const updatedHistory = [newItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(
          "autoScriptHistory",
          JSON.stringify(updatedHistory),
        );
      } else {
        setScript("Error: " + data.error);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setScript("Failed to connect to the backend. Please try again later.");
    }

    setLoading(false);
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    alert("Copied to clipboard! ✅");
  };

  return (
    // Simple black background
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative overflow-hidden">
      {/* 1. Standard Minimal Navbar */}
      <nav className="p-4 md:p-6 flex justify-between items-center border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-emerald-400">⚡</span> AutoScript AI
        </h1>

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all border border-slate-700 cursor-pointer shadow-sm text-sm"
        >
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          History
        </button>
      </nav>

      {/* 2. Main Generator Content */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center p-4 md:p-10">
        <div className="w-full max-w-2xl flex flex-col gap-6 md:gap-10 mt-6 md:mt-10 pb-20">
          {/* Simple Input Form Section */}
          <div className="flex flex-col gap-5">
            <p className="text-lg text-slate-300">Enter your video topic:</p>
            <form
              onSubmit={handleGenerate}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                placeholder="React vs Angular... DSA Logic... MERN Stack..."
                className="flex-1 p-3.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all text-base"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="p-3.5 rounded-lg font-semibold text-base bg-emerald-500 hover:bg-emerald-600 transition-all disabled:opacity-50 cursor-pointer text-slate-950"
              >
                {loading ? "Generating..." : "Generate Script!"}
              </button>
            </form>
          </div>

          {/* Clean Generated Script Box */}
          {script && (
            <div className="p-6 md:p-8 rounded-xl bg-slate-900/50 border border-slate-800 shadow-xl animate-fade-in flex flex-col gap-5">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h3 className="text-xl font-semibold text-white">
                  Generated Script:
                </h3>
                <button
                  onClick={() => handleCopy(script)}
                  className="px-4 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-all cursor-pointer border border-slate-700"
                >
                  Copy
                </button>
              </div>
              <div className="whitespace-pre-wrap text-slate-200 leading-relaxed font-mono text-sm md:text-base selection:bg-emerald-500/20 max-h-[60vh] overflow-y-auto pr-2">
                {script}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. History Sliding Drawer (DRAWER - Mobile Responsive Final) */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full sm:w-[380px] bg-slate-950 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isHistoryOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              ></path>
            </svg>
            Saved Scripts
          </h3>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Drawer Content - History List */}
        <div className="flex-1 flex flex-col gap-3 p-5 overflow-y-auto pr-2 pb-20 scrollbar-thin">
          {history.length === 0 ? (
            <div className="text-center mt-12 text-slate-600 flex flex-col items-center gap-3">
              <p>No history yet.</p>
              <p className="text-sm">
                Your generated scripts will appear here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
                onClick={() => {
                  setScript(item.generatedScript);
                  setIsHistoryOpen(false); // Mobile: Click karte hi sidebar band ho jayega
                }}
              >
                <h4 className="font-semibold text-sm text-slate-100 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                  {item.topic}
                </h4>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dark Overlay Backdrop - Only on Mobile */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 sm:hidden transition-opacity"
          onClick={() => setIsHistoryOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default App;
