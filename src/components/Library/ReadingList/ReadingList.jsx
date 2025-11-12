import { useSelector } from "react-redux";
import "../library.css";

export default function ReadingList({ books: propBooks }) {
  const storeBooks = useSelector((s) => s.books.list || []);
  const books =
    propBooks ||
    storeBooks.filter((b) => (b.status || "to-read") === "reading");

  return (
    <section className="section reading-section">
      <h3 className="section-title">Читаю</h3>

      <table className="reading-table" role="table">
        <thead>
          <tr>
            <th style={{ width: 36 }}></th>
            <th>Назва книги</th>
            <th>Автор</th>
            <th>Рік</th>
            <th>Стор.</th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr className="placeholder-row">
              <td colSpan={5}>📘 Немає активних книг</td>
            </tr>
          ) : (
            books.map((b) => (
              <tr key={b.id}>
                <td className="reading-icon-cell">📙</td>
                <td className="book-title">{b.title}</td>
                <td className="book-author">{b.author}</td>
                <td className="book-year">{b.year}</td>
                <td className="book-pages">{b.pages}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
