import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch user history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Failed to fetch history data:", error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    setScript("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (data.success) {
        setScript(data.script);
        // Refresh history list to include the newly generated script
        fetchHistory(); 
      } else {
        setScript("Error: " + data.error);
      }
    } catch (error) {
      setScript("Failed to connect to the server. Please verify your connection.");
    }
    
    setLoading(false);
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased flex flex-col relative overflow-hidden selection:bg-zinc-800">
      
      {/* Navigation Bar */}
      <nav className="px-6 py-4 flex justify-between items-center border-b border-zinc-900 bg-zinc-950 sticky top-0 z-40">
        <h1 className="text-lg font-medium tracking-tight text-zinc-100">
          AutoScript AI
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsHistoryOpen(true)} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            History
          </button>
          <div className="w-px h-4 bg-zinc-800"></div>
          <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Log out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center p-6 md:p-12">
        <div className="w-full max-w-3xl flex flex-col gap-8 mt-4 pb-20">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Create a new script</h2>
            <p className="text-zinc-400 text-sm">Enter a topic and let the AI draft your next YouTube video.</p>
          </div>

          {/* Generator Input Form */}
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g., MERN Stack vs MEAN Stack in 2026..."
              className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !topic}
              className="px-6 py-3 bg-zinc-100 text-zinc-900 rounded-md text-sm font-medium hover:bg-white transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </form>

          {/* Generated Output Display Area */}
          {script && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-500 mt-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Output</span>
                <button onClick={() => handleCopy(script)} className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1">
                  Copy text
                </button>
              </div>
              <div className="p-6 rounded-md bg-zinc-900 border border-zinc-800">
                <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed text-sm font-mono max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                  {script}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* History Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full z-50 w-full sm:w-[400px] bg-zinc-950 border-l border-zinc-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isHistoryOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center p-6 border-b border-zinc-900 bg-zinc-950 sticky top-0">
          <h3 className="text-base font-medium">History</h3>
          <button onClick={() => setIsHistoryOpen(false)} className="text-zinc-400 hover:text-zinc-100">Close</button>
        </div>

        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center mt-10">No scripts generated yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-md border border-transparent hover:border-zinc-800 hover:bg-zinc-900 transition-all cursor-pointer group"
                  onClick={() => {
                    setScript(item.generatedScript);
                    setTopic(item.topic);
                    setIsHistoryOpen(false);
                  }}
                >
                  <h4 className="font-medium text-sm text-zinc-200 line-clamp-1">{item.topic}</h4>
                  <p className="text-xs text-zinc-500 mt-1.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}