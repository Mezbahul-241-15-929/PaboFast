"use client";

import { useEffect, useMemo, useState } from "react";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    sku: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category_id: "",
    imageUrl: "",
    imageAlt: "",
  });

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      map.set(cat._id, cat.name);
    });
    return map;
  }, [categories]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error ? `${data.message}: ${data.error}` : data?.message || "Failed to load products"
        );
      }
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      // ignore for now
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const startEdit = (product) => {
    const firstImage = Array.isArray(product.images) ? product.images[0] : null;
    setEditingId(product._id);
    setEditData({
      sku: product.sku || "",
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? 0,
      stock: product.stock ?? 0,
      category_id: product.category_id || "",
      imageUrl: firstImage?.url || "",
      imageAlt: firstImage?.alt || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      setLoading(true);
      setError("");
      const payload = {
        ...editData,
        price: Number(editData.price),
        stock: Number(editData.stock),
        images: editData.imageUrl
          ? [{ url: editData.imageUrl, alt: editData.imageAlt || "" }]
          : [],
      };
      const res = await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update product");
      }
      await loadProducts();
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete product");
      }
      setProducts((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product</h1>
          <p className="mt-2 text-gray-600">
            Manage your products here.
          </p>
        </div>
        <button
          type="button"
          onClick={loadProducts}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-lg">
        <div className="border-b border-gray-100 px-6 py-4 text-sm text-gray-500">
          Total products: {products.length}
        </div>

        {error && (
          <div className="px-6 py-3 text-sm text-red-600">{error}</div>
        )}

        {loading && (
          <div className="px-6 py-3 text-sm text-gray-500">Loading...</div>
        )}

        {!loading && products.length === 0 && (
          <div className="px-6 py-6 text-sm text-gray-500">
            No products found.
          </div>
        )}

        {products.length > 0 && (
          <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const image = Array.isArray(product.images)
                ? product.images[0]
                : null;
              return (
                <div
                  key={product._id}
                  className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
                >
                  <div className="h-44 w-full bg-gray-100 flex items-center justify-center">
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={image.alt || product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    {editingId === product._id ? (
                      <>
                        <input
                          value={editData.name}
                          onChange={(event) =>
                            setEditData((prev) => ({
                              ...prev,
                              name: event.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                        />
                        <textarea
                          rows={2}
                          value={editData.description}
                          onChange={(event) =>
                            setEditData((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs"
                        />
                      </>
                    ) : (
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {product.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                      <div>
                        <div className="text-[11px] uppercase text-gray-400">
                          SKU
                        </div>
                        {editingId === product._id ? (
                          <input
                            value={editData.sku}
                            onChange={(event) =>
                              setEditData((prev) => ({
                                ...prev,
                                sku: event.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1 text-xs"
                          />
                        ) : (
                          <div className="mt-1 font-medium">{product.sku}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-gray-400">
                          Category
                        </div>
                        {editingId === product._id ? (
                          <select
                            value={editData.category_id}
                            onChange={(event) =>
                              setEditData((prev) => ({
                                ...prev,
                                category_id: event.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1 text-xs"
                          >
                            <option value="">Select</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="mt-1 font-medium">
                            {categoryMap.get(product.category_id) || product.category_id}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-gray-400">
                          Price
                        </div>
                        {editingId === product._id ? (
                          <input
                            type="number"
                            value={editData.price}
                            onChange={(event) =>
                              setEditData((prev) => ({
                                ...prev,
                                price: event.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1 text-xs"
                          />
                        ) : (
                          <div className="mt-1 font-medium">
                            {product.price}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] uppercase text-gray-400">
                          Stock
                        </div>
                        {editingId === product._id ? (
                          <input
                            type="number"
                            value={editData.stock}
                            onChange={(event) =>
                              setEditData((prev) => ({
                                ...prev,
                                stock: event.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1 text-xs"
                          />
                        ) : (
                          <div className="mt-1 font-medium">
                            {product.stock}
                          </div>
                        )}
                      </div>
                    </div>

                    {editingId === product._id && (
                      <div className="grid gap-2 text-xs text-gray-600">
                        <input
                          placeholder="Image URL"
                          value={editData.imageUrl}
                          onChange={(event) =>
                            setEditData((prev) => ({
                              ...prev,
                              imageUrl: event.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs"
                        />
                        <input
                          placeholder="Image Alt"
                          value={editData.imageAlt}
                          onChange={(event) =>
                            setEditData((prev) => ({
                              ...prev,
                              imageAlt: event.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      {editingId === product._id ? (
                        <>
                          <button
                            type="button"
                            onClick={handleUpdate}
                            className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
