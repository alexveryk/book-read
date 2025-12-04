import "./authLayout.css";

export const AuthLayout = ({ children, quote, benefits }) => {
  return (
    <div className="auth-container">
      <main className="auth-main">
        <section className="auth-card form-card">{children}</section>

        <section className="auth-card secondary-card">
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
