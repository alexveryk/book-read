import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../../services/authService";
import "./form.css";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await loginUser(email, password);
      console.log("Користувач:", user);
      navigate("/library");
    } catch (err) {
      console.error(err);
      setError("Помилка входу. Перевірте дані.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const user = await loginWithGoogle();
      console.log("Google user:", user);
      navigate("/library");
    } catch (err) {
      console.error(err);
      setError("Помилка входу через Google.");
    }
  };

  return (
    <div className="form-wrapper">
      <button className="google-btn" onClick={handleGoogleLogin} type="button">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google icon"
        />
        Увійти через Google
      </button>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Електронна адреса *</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Пароль *</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="submit-btn">
          Увійти
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p className="form-link">
        Немає акаунту? <Link to="/register">Зареєструватися</Link>
      </p>
    </div>
  );
};
