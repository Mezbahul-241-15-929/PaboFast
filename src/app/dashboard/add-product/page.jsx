"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { RefreshCw } from "lucide-react";

const AddProductPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [productStatus, setProductStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      price: 0,
      category_id: "",
      stock: 0,
      images: [{ url: "", alt: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const loadCategories = async () => {
    try {
      setCategoryStatus({ loading: true, error: "", success: "" });
      const res = await fetch("/api/categories");
      if (!res.ok) {
        throw new Error("Failed to load categories");
      }
      const data = await res.json();
      setCategories(data);
      if (data.length > 0) {
        setValue("category_id", data[0]._id);
      }
      setCategoryStatus({ loading: false, error: "", success: "" });
    } catch (error) {
      setCategoryStatus({
        loading: false,
        error: "Could not load categories.",
        success: "",
      });
    }
  };

  useEffect(() => {
    loadCategories();
  }, [setValue]);

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setCategoryStatus({
        loading: false,
        error: "Category name is required.",
        success: "",
      });
      return;
    }

    try {
      setCategoryStatus({ loading: true, error: "", success: "" });
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create category");
      }

      const created = {
        _id: data._id || data.categoryId,
        name: data.name || newCategory.name,
        slug: data.slug || newCategory.slug,
      };

      setCategories((prev) => {
        const exists = prev.some((cat) => cat._id === created._id);
        return exists ? prev : [created, ...prev];
      });
      setValue("category_id", created._id);
      setNewCategory({ name: "", slug: "", description: "" });
      setCategoryStatus({
        loading: false,
        error: "",
        success: "Category added.",
      });
    } catch (error) {
      setCategoryStatus({
        loading: false,
        error: error.message || "Failed to add category.",
        success: "",
      });
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
    };
    try {
      setProductStatus({ loading: true, error: "", success: "" });
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData?.message || "Failed to add product");
      }
      setProductStatus({
        loading: false,
        error: "",
        success: "Product added successfully.",
      });
      reset({
        sku: "",
        name: "",
        description: "",
        price: 0,
        category_id: payload.category_id,
        stock: 0,
        images: [{ url: "", alt: "" }],
      });
    } catch (error) {
      setProductStatus({
        loading: false,
        error: error.message || "Failed to add product.",
        success: "",
      });
    }
  };

  return (
    <div>
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Add Product</h1>
            <p className="mt-2 text-sm text-slate-200">
              Create a new product and keep your catalog updated.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadCategories}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  categoryStatus.loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-lg p-6 space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              type="text"
              placeholder="POTATO-001"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              {...register("sku", { required: "SKU is required" })}
            />
            {errors.sku && (
              <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              placeholder="Fresh Potato"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="High-quality potatoes per kg"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Price must be 0 or more" },
              })}
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock
            </label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              {...register("stock", {
                required: "Stock is required",
                min: { value: 0, message: "Stock must be 0 or more" },
              })}
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-red-600">
                {errors.stock.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              {...register("category_id", {
                required: "Category is required",
              })}
            >
              {categories.length === 0 && (
                <option value="">No categories yet</option>
              )}
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} {cat.slug ? `(${cat.slug})` : ""}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.category_id.message}
              </p>
            )}
            {categoryStatus.error && (
              <p className="mt-1 text-xs text-red-600">
                {categoryStatus.error}
              </p>
            )}
            {categoryStatus.success && (
              <p className="mt-1 text-xs text-green-600">
                {categoryStatus.success}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Add New Category
            </h2>
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={categoryStatus.loading}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black disabled:opacity-70"
            >
              {categoryStatus.loading ? "Saving..." : "Add Category"}
            </button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory.name}
              onChange={(event) =>
                setNewCategory((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Slug (optional)"
              value={newCategory.slug}
              onChange={(event) =>
                setNewCategory((prev) => ({
                  ...prev,
                  slug: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newCategory.description}
              onChange={(event) =>
                setNewCategory((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Images</h2>
            <button
              type="button"
              onClick={() => append({ url: "", alt: "" })}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + Add image
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:grid-cols-[2fr_1fr_auto]"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://i.ibb.co/XXXXX/potato1.jpg"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    {...register(`images.${index}.url`, {
                      required: "Image URL is required",
                    })}
                  />
                  {errors?.images?.[index]?.url && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.images[index].url.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    placeholder="Potato pack"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    {...register(`images.${index}.alt`, {
                      required: "Alt text is required",
                    })}
                  />
                  {errors?.images?.[index]?.alt && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.images[index].alt.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {productStatus.error && (
            <span className="text-xs text-red-600 mr-auto">
              {productStatus.error}
            </span>
          )}
          {productStatus.success && (
            <span className="text-xs text-green-600 mr-auto">
              {productStatus.success}
            </span>
          )}
          <button
            type="reset"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting || productStatus.loading}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow hover:shadow-md disabled:opacity-70"
          >
            {isSubmitting || productStatus.loading ? "Saving..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
