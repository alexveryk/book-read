import "./authLayout.css";

export const AuthLayout = ({ children, quote, title, benefits }) => {
  return (
    <div className="auth-container">
      <header className="auth-logo">BR</header>

      <main className="auth-main">
        <section className="auth-card form-card">{children}</section>

        <section className="auth-card secondary-card">
          {title && <h2 className="secondary-title">{title}</h2>}

          {quote && (
            <div className="quote-block">
              <p className="quote-text">„{quote}“</p>
              <p className="quote-author">Серапіон</p>
            </div>
          )}

          {benefits && (
            <ul className="benefits-list">
              {benefits.map((b, i) => (
                <li key={i} className="benefit-item">
                  <strong>{b.title}</strong>
                  <p>{b.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};
