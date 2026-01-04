import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const onSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    await login(form);
    navigate("/");
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <AuthCard title="Welcome back" subtitle="Login to access your dashboard.">
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input input-bordered w-full"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
        />

        <input
          className="input input-bordered w-full"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
        />

        <button className="btn btn-outline w-full" type="submit">
          Login
        </button>

        <p className="text-sm text-center text-base-content/70">
          New here?{" "}
          <Link className="link" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
