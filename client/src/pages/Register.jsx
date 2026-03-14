import React, { useState } from "react";
import { api } from "../services/apiService";

const Register = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.register(formData);
      console.log(data.success);

      if (data.success == "false") {
        console.log("inside if");
        setError(
          err?.response?.data?.message ||
            err.message ||
            data.message ||
            "Registration failed"
        );
      } else {
        onNavigateToLogin();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        relative min-h-screen font-sans
        bg-linear-to-br from-slate-950 via-slate-900 to-slate-800
        flex items-center justify-center
        p-4 sm:p-6
        motion-safe:transition-colors motion-safe:duration-300
      "
    >
      {/* Decorative gradient glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          [background:radial-gradient(60%_40%_at_20%_10%,rgba(99,102,241,0.25),transparent_60%),radial-gradient(50%_35%_at_80%_90%,rgba(56,189,248,0.18),transparent_60%)]
          blur-2xl
        "
      />

      {/* Card */}
      <div
        className="
          relative w-full max-w-md
          bg-white/90 dark:bg-slate-900/60 backdrop-blur
          rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]
          border border-white/20 dark:border-slate-800/60
          p-6 sm:p-8
        "
        role="region"
        aria-labelledby="registerTitle"
      >
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
            id="registerTitle"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Create Account
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Join TradePro today
          </p>
        </div>

        {/* Error box */}
        {error && (
          <div
            className="mb-4 rounded-xl border border-red-300/70 bg-red-50 text-red-800 px-4 py-3 leading-relaxed"
            role="alert"
            aria-live="assertive"
          >
            <p className="font-semibold">Sign-up error</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
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
              placeholder="John Doe"
            />
          </div>

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
              autoComplete="new-password"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Already have account */}
        <p className="text-center text-slate-600 dark:text-slate-300 mt-6">
          Already have an account?{" "}
          <button
            onClick={onNavigateToLogin}
            className="
              font-semibold text-indigo-600 hover:text-indigo-700
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
              ring-offset-white dark:ring-offset-slate-900
              motion-safe:transition-colors motion-safe:duration-200
            "
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
