import { useState } from "react";

const EMPTY = { id: "", name: "", description: "", price: "", quantity: "" };

export default function ProductForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(editing ?? EMPTY);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      id: Number(form.id),
      name: form.name,
      description: form.description,
      price: Number(form.price),
      quantity: Number(form.quantity),
    });
  }

  return (
    <section className="card">
      <h2>{editing ? `Update Product #${editing.id}` : "Add Product"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <label>
            ID
            <input type="number" name="id" value={form.id} onChange={update} disabled={!!editing} required />
          </label>
          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={update} required />
          </label>
        </div>
        <label>
          Description
          <input type="text" name="description" value={form.description} onChange={update} required />
        </label>
        <div className="row">
          <label>
            Price
            <input type="number" name="price" step="0.01" min="0" value={form.price} onChange={update} required />
          </label>
          <label>
            Quantity
            <input type="number" name="quantity" min="0" value={form.quantity} onChange={update} required />
          </label>
        </div>
        <div className="actions">
          <button type="submit">{editing ? "Update" : "Add"}</button>
          {editing && (
            <button type="button" className="secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
