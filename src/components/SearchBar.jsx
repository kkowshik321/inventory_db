function SearchBar({ search, setSearch }) {
  return (
    <input
      type="text"
      placeholder="Search by item name or description"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border p-3 rounded-lg w-full mb-4 border-gray-300 focus:outline-none focus:border-blue-500"
    />
  );
}

export default SearchBar;
