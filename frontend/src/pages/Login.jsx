import { useState } from "react";
import { loginUser } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/helpers";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);

      const user = getUserFromToken();
      if (user.role !== role) {
        localStorage.removeItem("token");
        setError("Wrong role selected. Please choose the correct role.");
        return;
      }

      if (role === "admin") navigate("/admin");
      else if (role === "trainer") navigate("/trainer");
      else navigate("/student");
    } catch (err) {
      // 🔴 Show exact error from backend (disabled account, wrong password, etc.)
      const msg = err?.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="bg-white border border-gray-200 shadow-lg p-8 rounded-xl w-80 text-gray-900">
        <h2 className="text-2xl mb-6 text-center font-bold text-green-700">🎓 LMS Login</h2>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <select
          className="w-full p-2 mb-3 bg-white border border-gray-300 rounded placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-700"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="trainer">Trainer</option>
          <option value="admin">Admin</option>
        </select>

        <input
          className="w-full p-2 mb-3 bg-white border border-gray-300 rounded placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-700"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 bg-white border border-gray-300 rounded placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-700"
          type="password"
          placeholder="Password"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-700 text-white p-2 rounded hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          onClick={() => navigate("/register")}
          className="text-sm text-gray-600 mt-4 text-center cursor-pointer hover:text-green-700"
        >
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}