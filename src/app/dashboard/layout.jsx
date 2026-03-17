"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FiMenu, FiHome, FiPlusSquare, FiShield, FiPackage } from "react-icons/fi";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.dbUser?.role === "admin";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }

    if (status === "authenticated" && !isAdmin) {
      signOut({ callbackUrl: "/signin" });
    }
  }, [status, isAdmin, router]);

  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const menuItemClass = (path, isCollapsed = false) =>
    `w-full py-2 rounded-lg transition flex items-center gap-2 ${isCollapsed ? "justify-center px-2" : "text-left px-4"
    } ${pathname === path
      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow"
      : "hover:bg-gray-100 text-gray-700"
    }`;

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className={`w-full ${isDesktopCollapsed ? "lg:w-20" : "lg:w-72"}`}>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-lg p-4">
            <div className="flex items-center justify-between mb-3 lg:justify-start">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="lg:hidden w-full flex items-center justify-between text-sm font-semibold text-gray-600"
              >
                <span className="inline-flex items-center gap-2">
                  <FiMenu size={16} />
                  Admin Menu
                </span>
                <span className="text-xs text-gray-400">
                  {isMenuOpen ? "Close" : "Open"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsDesktopCollapsed((prev) => !prev)}
                className="hidden lg:inline-flex items-center gap-2 px-3 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition"
                aria-label="Toggle admin menu"
              >
                <FiMenu size={16} />
                {!isDesktopCollapsed && "Admin Menu"}
              </button>
            </div>

            <div className="lg:hidden">
              <div
                className={`overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="mt-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 p-3">
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${menuItemClass("/dashboard")} bg-indigo-50 border border-indigo-100`}
                    >
                      <FiHome size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/product"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${menuItemClass("/dashboard/product")} bg-rose-50 border border-rose-100`}
                    >
                      <FiPackage size={16} />
                      Product
                    </Link>
                    <Link
                      href="/dashboard/add-product"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${menuItemClass("/dashboard/add-product")} bg-amber-50 border border-amber-100`}
                    >
                      <FiPlusSquare size={16} />
                      Add Product
                    </Link>
                    <Link
                      href="/dashboard/admin-panel"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${menuItemClass("/dashboard/admin-panel")} bg-emerald-50 border border-emerald-100`}
                    >
                      <FiShield size={16} />
                      Admin Panel
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className={`flex flex-col gap-2 ${isDesktopCollapsed ? "items-center" : ""}`}>
                <Link
                  href="/dashboard"
                  className={`${menuItemClass("/dashboard", isDesktopCollapsed)} bg-indigo-50 border border-indigo-100`}
                >
                  <FiHome size={16} />
                  {!isDesktopCollapsed && "Dashboard"}
                </Link>
                <Link
                  href="/dashboard/product"
                  className={`${menuItemClass("/dashboard/product", isDesktopCollapsed)} bg-rose-50 border border-rose-100`}
                >
                  <FiPackage size={16} />
                  {!isDesktopCollapsed && "Product"}
                </Link>
                <Link
                  href="/dashboard/add-product"
                  className={`${menuItemClass("/dashboard/add-product", isDesktopCollapsed)} bg-amber-50 border border-amber-100`}
                >
                  <FiPlusSquare size={16} />
                  {!isDesktopCollapsed && "Add Product"}
                </Link>
                <Link
                  href="/dashboard/admin-panel"
                  className={`${menuItemClass("/dashboard/admin-panel", isDesktopCollapsed)} bg-emerald-50 border border-emerald-100`}
                >
                  <FiShield size={16} />
                  {!isDesktopCollapsed && "Admin Panel"}
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {children}
        </div>
      </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
