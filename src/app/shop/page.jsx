"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FaEye,
  FaFilter,
  FaHeart,
  FaRegHeart,
  FaSearch,
  FaShoppingBag,
  FaSortAmountDown,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";

const tonePalette = [
  "from-rose-200/80 via-rose-100 to-amber-100",
  "from-sky-200/80 via-sky-100 to-cyan-100",
  "from-emerald-200/80 via-emerald-100 to-lime-100",
  "from-slate-200/80 via-slate-100 to-stone-100",
  "from-amber-200/80 via-amber-100 to-orange-100",
  "from-violet-200/80 via-violet-100 to-fuchsia-100",
  "from-indigo-200/80 via-indigo-100 to-blue-100",
  "from-zinc-200/80 via-zinc-100 to-neutral-100",
];

const ShopPage = () => {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortMode, setSortMode] = useState("newest");
  const [wishlist, setWishlist] = useState(new Set());
  const [cartItems, setCartItems] = useState(new Set());
  const [quickView, setQuickView] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error
            ? `${data.message}: ${data.error}`
            : data?.message || "Failed to load products"
        );
      }
      setProducts(Array.isArray(data) ? data : []);
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
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      // ignore category errors
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      if (cat?._id && cat?.name) {
        map.set(String(cat._id), String(cat.name));
      }
    });
    return map;
  }, [categories]);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) {
      return ["All", ...categories.map((cat) => String(cat.name))];
    }
    const values = new Set(["All"]);
    products.forEach((product) => {
      const category =
        product.category ||
        product.categoryName ||
        categoryMap.get(String(product.category_id)) ||
        product.category_id;
      if (category) values.add(String(category));
    });
    return Array.from(values);
  }, [categories, products, categoryMap]);

  const normalizedProducts = useMemo(() => {
    return products.map((product, index) => {
      const image = Array.isArray(product.images) ? product.images[0] : null;
      const priceValue =
        product.price ?? product.offerPrice ?? product.salePrice ?? 0;
      const numericPrice = Number(priceValue);
      const priceLabel = Number.isFinite(numericPrice)
        ? `$${numericPrice.toFixed(0)}`
        : String(priceValue || "-");
      const rating = Number(product.rating ?? 4.4);
      const category =
        product.category ||
        product.categoryName ||
        categoryMap.get(String(product.category_id)) ||
        product.category_id ||
        "General";
      return {
        id: product._id || product.id || product.sku || `${index}`,
        name: product.name || "Untitled product",
        description:
          product.description || "Curated essentials for modern living.",
        imageUrl: product.image || image?.url || "",
        imageAlt: product.imageAlt || image?.alt || product.name || "Product",
        price: numericPrice,
        priceLabel,
        rating,
        category: String(category),
        discount: product.discount || product.discountPercent || null,
        createdAt: product.createdAt || "2025-12-01",
        stock: product.stock ?? 0,
        tone: tonePalette[index % tonePalette.length],
      };
    });
  }, [products, categoryMap]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);
    return normalizedProducts.filter((product) => {
      const matchName = product.name.toLowerCase().includes(term);
      const matchCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchMin = min === null || product.price >= min;
      const matchMax = max === null || product.price <= max;
      return matchName && matchCategory && matchMin && matchMax;
    });
  }, [normalizedProducts, searchTerm, selectedCategory, minPrice, maxPrice]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortMode) {
      case "price-low":
        return list.sort((a, b) => a.price - b.price);
      case "price-high":
        return list.sort((a, b) => b.price - a.price);
      case "newest":
      default:
        return list.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [filteredProducts, sortMode]);

  const visibleProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount);
  }, [sortedProducts, visibleCount]);

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleCartItem = async (product) => {
    try {
      const sessionUser = session?.user?.dbUser || session?.user;
      const email = sessionUser?.email;
      const user_id = sessionUser?._id || sessionUser?.id;
      if (!email && !user_id) {
        toast.error("Please sign in to add items to cart");
        return;
      }
      if (cartItems.has(product.id)) {
        const res = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            user_id,
            productId: product.id,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to remove from cart");
        }
        setCartItems((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cart:updated"));
        }
        toast.success(`${product.name} removed from cart`);
        return;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          user_id,
          productId: product.id,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to add to cart");
      }
      setCartItems((prev) => new Set(prev).add(product.id));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:updated"));
      }
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.message || "Failed to update cart");
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSortMode("newest");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6f1ea_0%,#ffffff_45%,#eef3ff_100%)]">
      <Toaster position="bottom-right" />
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="hidden sm:block rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                <FaShoppingBag />
              </span>
              <h1 className="text-2xl font-semibold">Shop</h1>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
              {sortedProducts.length} items
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/shop" className="hover:text-white">
              Shop
            </Link>
            {selectedCategory !== "All" && (
              <>
                {" "}
                /{" "}
                <span className="hover:text-white cursor-default">
                  {selectedCategory}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
        <aside className="hidden w-full max-w-xs shrink-0 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl lg:block">
          <FilterPanel
            categories={categoryOptions}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            sortMode={sortMode}
            setSortMode={setSortMode}
            resetFilters={resetFilters}
          />
        </aside>

        <section className="flex-1">
          <div className="mb-6 space-y-3 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-3 lg:space-y-0">
            <div className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <FaSearch className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products"
                className="w-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="grid w-full grid-cols-2 gap-3 lg:flex lg:w-auto lg:items-center lg:justify-self-end">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm lg:hidden"
              >
                <FaFilter />
                Filters
              </button>

              <div className="relative w-full min-w-0 lg:w-[220px]">
                <button
                  type="button"
                  onClick={() => setSortOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:border-slate-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FaSortAmountDown />
                    {sortMode === "newest"
                      ? "Newest"
                      : sortMode === "price-low"
                      ? "Price low to high"
                      : "Price high to low"}
                  </span>
                  <span className="text-slate-400">▾</span>
                </button>

                {sortOpen && (
                  <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setSortMode("newest");
                        setSortOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Newest
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortMode("price-low");
                        setSortOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Price low to high
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortMode("price-high");
                        setSortOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Price high to low
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Filters</p>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="rounded-full border border-slate-200 p-2 text-slate-600"
                >
                  <FaTimes />
                </button>
              </div>
              <FilterPanel
                categories={categoryOptions}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                sortMode={sortMode}
                setSortMode={setSortMode}
                resetFilters={resetFilters}
              />
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-72 animate-pulse rounded-3xl border border-slate-100 bg-white p-4 shadow-lg"
                >
                  <div className="h-36 rounded-2xl bg-slate-100" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && sortedProducts.length === 0 && (
            <div className="rounded-3xl border border-slate-100 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-lg">
              No products found. Try adjusting your filters.
            </div>
          )}

          {!loading && sortedProducts.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlisted={wishlist.has(product.id)}
                    inCart={cartItems.has(product.id)}
                    onWishlist={() => toggleWishlist(product.id)}
                    onAddToCart={() => toggleCartItem(product)}
                    onQuickView={() => setQuickView(product)}
                  />
                ))}
              </div>

              {visibleCount < sortedProducts.length && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {quickView && (
        <QuickViewModal
          product={quickView}
          onClose={() => setQuickView(null)}
          onAddToCart={() => toggleCartItem(quickView)}
          onWishlist={() => toggleWishlist(quickView.id)}
          wishlisted={wishlist.has(quickView.id)}
          inCart={cartItems.has(quickView.id)}
        />
      )}
    </div>
  );
};

const FilterPanel = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  sortMode,
  setSortMode,
  resetFilters,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-900">Category</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <button
              key={`${category}-${index}`}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === category
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">Price range</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input
            type="number"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Min"
            className="rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-slate-500 focus:outline-none"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Max"
            className="rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
      >
        Reset filters
      </button>
    </div>
  );
};

const ProductCard = ({
  product,
  wishlisted,
  inCart,
  onWishlist,
  onAddToCart,
  onQuickView,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="absolute right-4 top-4 flex items-center gap-2 text-xs font-semibold">
        {product.discount && (
          <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
            -{product.discount}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-700">
            Sold out
          </span>
        )}
      </div>
      <div
        className={`h-40 overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br ${product.tone} shadow-[0_10px_30px_-20px_rgba(15,23,42,0.6)]`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.imageAlt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center border border-white/60 bg-white/50 text-xs text-slate-600">
            No image
          </div>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {product.category}
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs text-slate-500">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-slate-900">
            {product.priceLabel}
          </p>
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <FaStar />
            <span className="font-semibold text-slate-700">
              {Number.isFinite(product.rating)
                ? product.rating.toFixed(1)
                : "0.0"}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onAddToCart}
          className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold text-white transition ${
            inCart ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {inCart ? "In cart" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={onWishlist}
          className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-slate-400"
          aria-label="Add to wishlist"
        >
          {wishlisted ? (
            <FaHeart className="text-rose-500" />
          ) : (
            <FaRegHeart />
          )}
        </button>
        <button
          type="button"
          onClick={onQuickView}
          className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-slate-400"
          aria-label="Quick view"
        >
          <FaEye />
        </button>
      </div>
    </div>
  );
};

const QuickViewModal = ({
  product,
  onClose,
  onAddToCart,
  onWishlist,
  wishlisted,
  inCart,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-600"
        >
          <FaTimes />
        </button>
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
          <div className="rounded-2xl bg-slate-100 p-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.imageAlt}
                className="h-72 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-2xl border border-white/60 bg-white/50 text-xs text-slate-600">
                No image
              </div>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {product.category}
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {product.name}
            </h3>
            <p className="text-sm text-slate-600">{product.description}</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-semibold text-slate-900">
                {product.priceLabel}
              </p>
              {product.discount && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Save {product.discount}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-500">
              <FaStar />
              <span className="font-semibold text-slate-700">
                {Number.isFinite(product.rating)
                  ? product.rating.toFixed(1)
                  : "0.0"}{" "}
                rating
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onAddToCart}
                className={`rounded-full px-6 py-2 text-sm font-semibold text-white ${
                  inCart ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {inCart ? "In cart" : "Add to cart"}
              </button>
              <button
                type="button"
                onClick={onWishlist}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {wishlisted ? "Wishlisted" : "Add to wishlist"}
              </button>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              Free delivery over $80. Ships in 24 hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;

