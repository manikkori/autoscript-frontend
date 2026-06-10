import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLoginMode ? "/auth/login" : "/auth/signup";

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();

      if (data.success) {
        if (isLoginMode) {
          localStorage.setItem("token", data.token);
          // Redirect to dashboard upon successful authentication
          window.location.href = "/dashboard"; 
        } else {
          setIsLoginMode(true);
          setError("Account created successfully! Please log in.");
        }
      } else {
        setError(data.message || "Authentication failed.");
      }
    } catch (err) {
      setError("Network error. Please check your server connection.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 antialiased selection:bg-zinc-800">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 p-8 rounded-md shadow-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100">
            {isLoginMode ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            {isLoginMode ? "Enter your credentials to access AutoScript" : "Sign up to start generating scripts"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <input
              type="email"
              required
              className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Password</label>
            <input
              type="password"
              required
              className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full p-2.5 bg-zinc-100 text-zinc-900 rounded-md text-sm font-medium hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : (isLoginMode ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-zinc-100 hover:underline underline-offset-4"
          >
            {isLoginMode ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}