import { useEffect, useState } from "react";
import { api } from "./api";
import ProductForm from "./components/ProductForm";
import ProductSearch from "./components/ProductSearch";
import ProductTable from "./components/ProductTable";
import Toast from "./components/Toast";

export default function App() {
  const [greeting, setGreeting] = useState("Connecting to API...");
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // product being edited, or null
  const [toast, setToast] = useState(null);     // { message, error }

  const notify = (message, error = false) => setToast({ message, error });

  async function loadProducts() {
    try {
      setProducts(await api.getProducts());
    } catch (err) {
      notify("Failed to load products: " + err.message, true);
    }
  }

  useEffect(() => {
    api
      .greeting()
      .then(setGreeting)
      .catch(() => setGreeting("API unreachable - is uvicorn running?"));
    loadProducts();
  }, []);

  async function handleSubmit(product) {
    try {
      const res = editing
        ? await api.updateProduct(editing.id, product)
        : await api.addProduct(product);
      notify(res.message);
      setEditing(null);
      loadProducts();
    } catch (err) {
      notify(err.message, true);
    }
  }

  async function handleDelete(id) {
    if (!confirm(`Delete product ${id}?`)) return;
    try {
      const res = await api.deleteProduct(id);
      notify(res.message);
      loadProducts();
    } catch (err) {
      notify(err.message, true);
    }
  }

  return (
    <>
      <header>
        <h1>Product Manager</h1>
        <p className="muted">{greeting}</p>
      </header>

      <main>
        <ProductForm
          key={editing ? editing.id : "new"}
          editing={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
        <ProductSearch onError={(msg) => notify(msg, true)} />
        <ProductTable
          products={products}
          onRefresh={loadProducts}
          onEdit={(p) => {
            setEditing(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDelete={handleDelete}
        />
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
