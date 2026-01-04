import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    district: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    await register(form);
    setSuccess("Registration successful. You can now log in.");
    setTimeout(() => navigate("/login"), 1200);
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <AuthCard
      title="Create your account"
      subtitle="Register to participate. Your status and tournament details will be updated after setup."
    >
    {error && <div className="alert alert-error">{error}</div>}
    {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input input-bordered w-full"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={onChange}
          required
        />

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
          name="phone"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={onChange}
        />

        <input
          className="input input-bordered w-full"
          name="district"
          placeholder="District (optional)"
          value={form.district}
          onChange={onChange}
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
          Register
        </button>

        <p className="text-sm text-center text-base-content/70">
          Already have an account?{" "}
          <Link className="link" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
