import React, { useState } from "react";
import { api } from "../services/apiService";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

const Login = ({ onNavigateToRegister }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(formData);
      const data = res && res.data ? res.data : res;
      if (!data) throw new Error("Empty response from server");
      if (data.success === false)
        throw new Error(data.error || data.message || "Login failed");
      const token =
        data.token || (data.accessToken && data.accessToken.token) || null;
      const user = data.user || (data.user_id ? data.user : null);
      if (!token || !user)
        throw new Error(
          data.error || data.message || "Malformed server response"
        );
      authService.setToken(token);
      await login(user);
    } catch (err) {
      const serverMessage =
        (err.response &&
          err.response.data &&
          (err.response.data.error || err.response.data.message)) ||
        err.message ||
        "Something went wrong. Please try again.";
      console.log(err);
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen font-sans
        bg-linear-to-br from-slate-950 via-slate-900 to-slate-800
        motion-safe:transition-colors motion-safe:duration-300
        flex items-center justify-center p-4 sm:p-6
      "
    >
      <div
        className="
          w-full max-w-md
          bg-white/90 dark:bg-slate-900/60 backdrop-blur
          rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]
          border border-white/20 dark:border-slate-800/60
          p-6 sm:p-8
        "
        role="region"
        aria-labelledby="loginTitle"
      >
        {/* Logo / Badge */}
        <div className="text-center mb-8">
          <div
            className="
              w-16 h-16 mx-auto mb-4 rounded-2xl
              bg-linear-to-br from-indigo-500 via-blue-600 to-cyan-500
              shadow-lg shadow-indigo-900/20
              flex items-center justify-center
            "
            aria-hidden="true"
          >
            <span className="text-3xl font-extrabold text-white tracking-tight">
              T
            </span>
          </div>

          <h1
            id="loginTitle"
            className="
              text-3xl sm:text-4xl font-extrabold tracking-tight
              text-slate-900 dark:text-slate-100
            "
          >
            Welcome Back
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Sign in to your account
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="
              mb-4 rounded-xl border border-red-300/70 bg-red-50 text-red-800
              px-4 py-3 leading-relaxed
            "
            role="alert"
            aria-live="assertive"
          >
            {/* <p className="font-semibold">Sign-in error</p> */}
            <p className="mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              aria-invalid={!!error}
              className="
                w-full px-4 py-3 rounded-xl
                bg-white dark:bg-slate-950/60
                border border-slate-300 dark:border-slate-700
                text-slate-900 dark:text-slate-100 placeholder-slate-400
                outline-none
                focus:border-transparent focus:ring-2 focus:ring-indigo-500/70
                motion-safe:transition-all motion-safe:duration-200
                shadow-sm
              "
              placeholder="john@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="
                w-full px-4 py-3 rounded-xl
                bg-white dark:bg-slate-950/60
                border border-slate-300 dark:border-slate-700
                text-slate-900 dark:text-slate-100 placeholder-slate-400
                outline-none
                focus:border-transparent focus:ring-2 focus:ring-indigo-500/70
                motion-safe:transition-all motion-safe:duration-200
                shadow-sm
              "
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl font-semibold text-white tracking-wide
              bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-500
              shadow-md
              hover:from-indigo-600/95 hover:via-blue-600/95 hover:to-cyan-500/95
              active:scale-[0.99]
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500
              ring-offset-white dark:ring-offset-slate-900
              motion-safe:transition-all motion-safe:duration-200
            "
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-600 dark:text-slate-300 mt-6">
          Don&apos;t have an account?{" "}
          <button
            onClick={onNavigateToRegister}
            className="
              font-semibold text-indigo-600 hover:text-indigo-700
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
              ring-offset-white dark:ring-offset-slate-900
              motion-safe:transition-colors motion-safe:duration-200
            "
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
