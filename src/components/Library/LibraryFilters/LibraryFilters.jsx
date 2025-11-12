const LibraryFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="library-filters">
      <input
        type="text"
        placeholder="Назва книги"
        value={filters.title}
        onChange={(e) => onFilterChange("title", e.target.value)}
      />
      <input
        type="text"
        placeholder="Автор"
        value={filters.author}
        onChange={(e) => onFilterChange("author", e.target.value)}
      />
    </div>
  );
};

export default LibraryFilters;
