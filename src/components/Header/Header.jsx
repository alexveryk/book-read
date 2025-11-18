import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { requestNavigation } from "../../utils/navigationGuard";
import "./header.css";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || "Користувач";
  const avatarChar = (
    user?.displayName?.[0] ||
    user?.email?.[0] ||
    "U"
  ).toUpperCase();

  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className="app-header" ref={headerRef}>
      <div className="header-content">
        <div
          className="header-left"
          onClick={() => requestNavigation(() => navigate("/"))}
          style={{ cursor: "pointer" }}>
          <div className="logo">BR</div>
        </div>
        <div className="header-center">
          <div
            className="avatar desktop-avatar"
            onClick={() => setOpen((s) => !s)}>
            {avatarChar}
          </div>
          <div className="username">{displayName}</div>
        </div>

        <div className="header-right">
          <button
            className="icon-btn"
            title="Мої тренування"
            onClick={() => requestNavigation(() => navigate("/training"))}>
            icon-btn
          </button>

          <button
            className="icon-btn"
            title="Бібліотека"
            onClick={() => requestNavigation(() => navigate("/library"))}>
            icon-btn
          </button>

          <div
            className="avatar mobile-avatar"
            onClick={() => setOpen((s) => !s)}>
            {avatarChar}
          </div>

          <button
            className="logout-link"
            onClick={() => requestNavigation(() => handleLogout())}>
            Вихід
          </button>
        </div>

        {open && (
          <div className="avatar-menu" role="menu">
            <button
              className="menu-item"
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}>
              Профіль
            </button>
            <button className="menu-item" onClick={handleLogout}>
              Вихід
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
