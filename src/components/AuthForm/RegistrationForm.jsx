import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, loginWithGoogle } from "../../services/authService";
import "./form.css";

export const RegistrationForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Будь ласка, вкажіть ім'я.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Паролі не співпадають.");
      return;
    }

    try {
      const user = await registerUser(email, password, { displayName: name });
      console.log("Зареєстрований користувач:", user);
      navigate("/library");
    } catch (err) {
      console.error(err);
      setError("Помилка реєстрації. Спробуйте ще раз.");
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    try {
      const user = await loginWithGoogle();
      console.log("Google user:", user);
      navigate("/library");
    } catch (err) {
      console.error(err);
      setError("Помилка Google-реєстрації.");
    }
  };

  return (
    <div className="form-wrapper">
      <button
        className="google-btn"
        type="button"
        onClick={handleGoogleRegister}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google icon"
        />
        Зареєструватися через Google
      </button>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Ім'я *</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <label htmlFor="confirmPassword">Підтвердити пароль *</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className="submit-btn">
          Зареєструватися
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p className="form-link">
        Вже з нами? <Link to="/login">Увійти</Link>
      </p>
    </div>
  );
};
