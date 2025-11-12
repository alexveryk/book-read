import { useSelector } from "react-redux";
import "../library.css";

export default function ReadList({ books: propBooks, onOpenResume }) {
  const storeBooks = useSelector((s) => s.books.list || []);
  const books =
    propBooks || storeBooks.filter((b) => (b.status || "to-read") === "read");

  const renderStars = (rating = 0) => {
    const max = 5;
    return (
      <div className="stars">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={i < rating ? "star filled" : "star"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="section read-section">
      <h3 className="section-title">Прочитано</h3>

      <table className="read-table" role="table">
        <thead>
          <tr>
            <th style={{ width: 36 }}></th>
            <th>Назва книги</th>
            <th>Автор</th>
            <th>Рік</th>
            <th>Стор.</th>
            <th>Рейтинг книги</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr className="placeholder-row">
              <td colSpan={7}>📘 Немає прочитаних книг</td>
            </tr>
          ) : (
            books.map((b) => (
              <tr key={b.id}>
                <td className="book-icon-cell">📘</td>
                <td className="book-title">{b.title}</td>
                <td className="book-author">{b.author}</td>
                <td className="book-year">{b.year}</td>
                <td className="book-pages">{b.pages}</td>
                <td className="book-rating">{renderStars(b.rating || 0)}</td>
                <td>
                  <button
                    className="btn-resume"
                    onClick={() => onOpenResume && onOpenResume(b)}>
                    Резюме
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
