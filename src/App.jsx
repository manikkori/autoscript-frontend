import { useState, useEffect } from 'react';

function App() {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // --- Local Storage se History Fetch Karna ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('autoScriptHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    setScript('');

    try {
      const response = await fetch('https://autoscript-backend-1.onrender.com/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      
      if (data.success) {
        setScript(data.script);
        
        // --- Nayi Script ko Local Storage mein Save Karna ---
        const newItem = {
          id: Date.now(),
          topic: topic,
          generatedScript: data.script,
          createdAt: new Date().toISOString()
        };
        
        const updatedHistory = [newItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('autoScriptHistory', JSON.stringify(updatedHistory));
        
      } else {
        setScript("Error: " + data.error);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setScript("Failed to connect to the backend. Please ensure the server is running on port 5000.");
    }
    
    setLoading(false);
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    alert("Script copied to clipboard!");
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center">
      
      <h1 className="text-4xl font-bold text-center mt-4 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
        AutoScript AI
      </h1>
      <p className="text-center text-slate-300 mb-10">AI-Powered Content & Script Engine</p>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Generator Section */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl">
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter your video topic (e.g., React vs Angular)..."
                className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full p-4 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Generating Script...' : 'Generate Script!'}
              </button>
            </form>

            {script && (
              <div className="mt-8 p-6 rounded-xl bg-slate-900/80 border border-slate-700">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                  <h3 className="text-xl font-semibold text-emerald-400">Current Script:</h3>
                  <button 
                    onClick={() => handleCopy(script)} 
                    className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-all cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-mono text-sm max-h-96 overflow-y-auto">
                  {script}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar Section (Ab Local Storage se) */}
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl h-[calc(100vh-200px)] flex flex-col">
          <h3 className="text-xl font-bold mb-4 text-blue-400 border-b border-slate-700 pb-2">My History</h3>
          <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2">
            {history.length === 0 ? (
              <p className="text-slate-400 text-sm text-center mt-4">No history yet. Generate some scripts!</p>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-slate-500 transition-all cursor-pointer"
                  onClick={() => setScript(item.generatedScript)}
                >
                  <h4 className="font-semibold text-sm text-slate-200 truncate">{item.topic}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
