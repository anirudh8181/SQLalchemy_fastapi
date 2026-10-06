export default function ProductTable({ products, onRefresh, onEdit, onDelete }) {
  return (
    <section className="card">
      <div className="row space-between">
        <h2>All Products</h2>
        <button type="button" className="secondary" onClick={onRefresh}>
          Refresh
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Qty</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="muted">No products yet.</td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <button className="small secondary" onClick={() => onEdit(p)}>Edit</button>{" "}
                  <button className="small danger" onClick={() => onDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
