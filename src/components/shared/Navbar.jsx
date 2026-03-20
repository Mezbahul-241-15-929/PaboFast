"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AiOutlineHeart, AiOutlineBell, AiOutlineShoppingCart } from 'react-icons/ai';
import {
  FiMenu,
  FiX,
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = user?.dbUser?.role === "admin";
  const isVerified = user?.dbUser?.emailVerified === true;



  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };
  const handleDesktopDropdownClose = () => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const sessionUser = session?.user?.dbUser || session?.user;
        const email = sessionUser?.email;
        const user_id = sessionUser?._id || sessionUser?.id;
        if (!email && !user_id) {
          setCartCount(0);
          return;
        }

        const params = new URLSearchParams();
        if (email) params.set("email", email);
        if (user_id) params.set("user_id", user_id);

        const res = await fetch(`/api/cart?${params.toString()}`);
        if (!res.ok) {
          setCartCount(0);
          return;
        }
        const data = await res.json();
        const count = Array.isArray(data?.items) ? data.items.length : 0;
        setCartCount(count);
      } catch (err) {
        setCartCount(0);
      }
    };

    loadCartCount();
    const handleCartUpdate = () => loadCartCount();
    if (typeof window !== "undefined") {
      window.addEventListener("cart:updated", handleCartUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("cart:updated", handleCartUpdate);
      }
    };
  }, [session?.user]);

  const getLinkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${pathname === path
      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
      : "text-gray-700 hover:bg-gray-100"
    }`;

  const signInBtnClass =
    "px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2";
  const iconBtnClass =
    "h-10 w-10 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 inline-flex items-center justify-center";

  const mobileLinks = (
    <>
      <Link
        href="/"
        onClick={() => setIsMenuOpen(false)}
        className={getLinkClass("/")}
      >
        <FiHome size={18} /> Home
      </Link>
      <Link
        href="/shop"
        onClick={() => setIsMenuOpen(false)}
        className={getLinkClass("/shop")}
      >
        <AiOutlineShoppingCart size={18} /> Shop
      </Link>
      <Link
        href="/cart"
        onClick={() => setIsMenuOpen(false)}
        className={getLinkClass("/cart")}
      >
        <AiOutlineShoppingCart size={18} /> Cart
      </Link>
      <Link
        href="/notifications"
        onClick={() => setIsMenuOpen(false)}
        className={getLinkClass("/notifications")}
      >
        <AiOutlineBell size={18} /> Notifications
      </Link>
      <Link
        href="/wishlist"
        onClick={() => setIsMenuOpen(false)}
        className={getLinkClass("/wishlist")}
      >
        <AiOutlineHeart size={18} /> Wishlist
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div>
            <Link href="/">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Center: Search + Home */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-center px-4">
            <div className="w-full max-w-xl">
              <SearchBar />
            </div>
            <Link href="/" className={`${getLinkClass("/")} bg-gray-100 hover:bg-gray-200`}>
              <FiHome size={18} /> Home
            </Link>
            <Link href="/shop" className={`${getLinkClass("/shop")} bg-gray-100 hover:bg-gray-200`}>
              <AiOutlineShoppingCart size={18} /> Shop
            </Link>
          </div>


          {/* Right Side (Desktop Icons + Auth) */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/notifications">
              <button
                className={
                  (pathname === "/notifications"
                    ? "h-10 w-10 rounded-lg inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : iconBtnClass) + " cursor-pointer relative"
                }
              >
                <AiOutlineBell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </Link>
            <Link href="/wishlist">
              <button
                className={
                  (pathname === "/wishlist"
                    ? "h-10 w-10 rounded-lg inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : iconBtnClass) + " cursor-pointer"
                }
              >
                <AiOutlineHeart size={18} />
              </button>
            </Link>
            <Link href="/cart">
              <button
                className={
                  (pathname === "/cart"
                    ? "h-10 w-10 rounded-lg inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : iconBtnClass) + " cursor-pointer relative"
                }
              >
                <AiOutlineShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
            {status === "authenticated" ? (
              <div className="dropdown dropdown-end">
                {/* Desktop Trigger: Profile Image */}
                <label
                  tabIndex={0}
                  className="cursor-pointer flex items-center"
                >
                  <div className="relative">
                    <img
                      alt="User avatar"
                      src={
                        user?.image ||
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      }
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                </label>

                {/* Dropdown Content */}
                <div
                  tabIndex={0}
                  className="dropdown-content mt-3 z-[1] p-4 shadow-2xl bg-white rounded-xl w-72 border border-gray-100"
                >
                  {/* Header: Photo Left, Info Right */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <img
                        src={
                          user?.image ||
                          "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        }
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-800 truncate">
                        {user?.name || "User Name"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-2"></div>

                  <ul className="space-y-1">
                    {!isVerified ? (
                      <li>
                        <h2 className="getLinkClass">
                          Account not verified
                        </h2>
                      </li>
                    ) : (
                      <>
                      </>
                    )}
                    <li>
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className={getLinkClass("/profile")}
                        onClickCapture={handleDesktopDropdownClose}
                      >
                        <FiUser className="text-gray-400" /> Profile
                      </Link>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className={getLinkClass("/dashboard")}
                          onClickCapture={handleDesktopDropdownClose}
                        >
                          <FiHome className="text-gray-400" /> Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        href="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className={getLinkClass("/settings")}
                        onClickCapture={handleDesktopDropdownClose}
                      >
                        <FiSettings className="text-gray-400" /> Settings
                      </Link>
                    </li>
                    <li className="pt-2">
                      <button
                        onClick={handleSignOut}
                        className="cursor-pointer w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <Link href="/signin">
                <button className={iconBtnClass + " cursor-pointer"}>
                  <AiOutlineUser size={18} />
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Right Icons */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (under top row) */}
      <div className="md:hidden px-4 pb-3 flex items-center gap-3">
        <div className="flex-1">
          <SearchBar />
        </div>
        <Link href="/cart">
          <button
            className={
              (pathname === "/cart"
                ? "h-10 w-10 rounded-lg inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "h-10 w-10 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 inline-flex items-center justify-center") +
              " relative cursor-pointer"
            }
          >
            <AiOutlineShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </Link>
      </div>

      {/* Mobile Menu (UNCHANGED) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-16 left-4 right-4 bg-white rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={
                      user?.image ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    }
                    alt="User avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {user?.name || "Welcome"}
                  </div>
                  {user?.email && (
                    <div className="text-sm text-gray-500">{user.email}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="mt-4 grid gap-2">{mobileLinks}</div>
            <div className="mt-4 border-t pt-4 flex flex-col gap-2">
              {status === "authenticated" ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={getLinkClass("/profile")}
                  >
                    <FiUser size={18} /> Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={getLinkClass("/dashboard")}
                    >
                      <FiHome size={18} /> Dashboard
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className={getLinkClass("/settings")}
                  >
                    <FiSettings size={18} /> Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-95 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                  <button className="cursor-pointer w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                    <AiOutlineUser
                      size={18}
                      className="inline-block mr-2"
                    />
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
