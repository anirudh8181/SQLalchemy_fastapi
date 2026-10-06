// All calls to the FastAPI backend live here.
const BASE = "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  // Some endpoints return a plain string like "product not found" with a 200
  if (typeof data === "string" && data.toLowerCase().includes("not found")) {
    throw new Error(data);
  }
  return data;
}

export const api = {
  greeting: () => request("/"),                                   // GET /
  getProducts: () => request("/products"),                        // GET /products
  getProduct: (id) => request(`/product/${id}`),                  // GET /product/{id}
  addProduct: (product) =>                                        // POST /add/product
    request("/add/product", { method: "POST", body: JSON.stringify(product) }),
  updateProduct: (id, product) =>                                 // PUT /product?id=
    request(`/product?id=${id}`, { method: "PUT", body: JSON.stringify(product) }),
  deleteProduct: (id) =>                                          // DELETE /delete/product/{id}
    request(`/delete/product/${id}`, { method: "DELETE" }),
};
