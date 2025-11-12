import { LibraryRow } from "../LibraryRow/LibraryRow";

const LibraryTable = ({ books }) => {
  return (
    <table className="library-table">
      <thead>
        <tr>
          <th>Назва книги</th>
          <th>Автор</th>
          <th>Сторінок</th>
          <th>Статус</th>
          <th>Рейтинг</th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <LibraryRow key={book.id} book={book} />
        ))}
      </tbody>
    </table>
  );
};

export default LibraryTable;
