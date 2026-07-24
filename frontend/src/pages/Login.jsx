import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col justify-center px-6 py-12 max-w-md mx-auto transition-colors duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl mb-6 text-center font-medium text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition shadow-inner"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm mb-2">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition shadow-inner"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 hover:opacity-95 active:scale-[0.99] transition duration-200 mt-2"
        >
          Sign In
        </button>
      </form>

      <p className="text-center text-slate-600 dark:text-slate-400 mt-8 font-medium">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
        >
          Register now
        </Link>
      </p>
    </div>
  );
};

export default Login;
