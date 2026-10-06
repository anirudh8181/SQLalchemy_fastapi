import { useState } from "react";
import { api } from "../api";

export default function ProductSearch({ onError }) {
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    try {
      setResult(await api.getProduct(id));
    } catch (err) {
      setResult(null);
      onError(err.message);
    }
  }

  function clear() {
    setId("");
    setResult(null);
  }

  return (
    <section className="card">
      <h2>Find Product by ID</h2>
      <form className="row" onSubmit={handleSearch}>
        <input
          type="number"
          placeholder="Enter product ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <button type="submit">Search</button>
        <button type="button" className="secondary" onClick={clear}>
          Clear
        </button>
      </form>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </section>
  );
}
