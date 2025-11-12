export const LibraryRow = ({ book }) => {
  return (
    <tr>
      <td>{book.title}</td>
      <td>{book.author}</td>
      <td>{book.pages}</td>
      <td>{book.status}</td>
      <td>{book.rating}</td>
    </tr>
  );
};
