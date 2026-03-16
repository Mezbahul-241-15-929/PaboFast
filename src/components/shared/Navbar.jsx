"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getLinkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
      pathname === path
        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const signInBtnClass =
    "px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2";

  const links = (
    <>
      <Link
        href="/"
        onClick={() => setIsMenuOpen(false)}
        className={getLinkClass("/")}
      >
        <FiHome size={18} /> Home
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">{links}</div>

          {/* Right Side (Authenticated / Guest) */}
          {status === "authenticated" ? (
            <div className="hidden md:flex items-center gap-4">
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
                    <li>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                      >
                        <FiUser className="text-gray-400" /> Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
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
            </div>
          ) : (
            <Link href="/signin">
              <button className={signInBtnClass + " hidden md:flex"}>
                <AiOutlineUser size={18} /> Sign In
              </button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
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
            <div className="mt-4 grid gap-2">{links}</div>
            <div className="mt-4 border-t pt-4 flex flex-col gap-2">
              {status === "authenticated" ? (
                <>
                  <Link
                    href="/profile"
                    className="w-full px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="w-full px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-95 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/signin">
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