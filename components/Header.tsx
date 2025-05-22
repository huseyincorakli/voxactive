"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/learn/practice", label: "Practice" },
  { href: "/learn/talk", label: "Talk2AI" },
  { href: "/learn/shadowing", label: "Shadowing" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname(); // Get the current route

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header
      className="sticky top-0 z-50    sm:justify-start sm:flex-nowrap w-full text-lg py-3"
      role="banner"
    >
      <div className="w-full px-4 sm:px-6 mx-auto sm:flex sm:items-center sm:justify-between">
        <nav
          className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between 
      rounded-xl border-zinc-800 border  shadow-sm p-3  backdrop-blur-sm bg-zinc-900/80"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between">
            <a
              className="flex-none text-3xl font-semibold focus:outline-hidden focus:opacity-80"
              href="/"
              aria-label="VoxActive"
            >
              <span className="text-blue-400 text-3xl font-bold">Vox</span>
              Active
            </a>
            <div className="sm:hidden">
              <button
                type="button"
                className="relative size-9 flex justify-center items-center gap-x-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                aria-expanded={isMenuOpen}
                aria-controls="hs-navbar-example"
                aria-label="Toggle navigation"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <X className="shrink-0 size-4" />
                ) : (
                  <Menu className="shrink-0 size-4" />
                )}
                <span className="sr-only">Toggle navigation</span>
              </button>
            </div>
          </div>
          <div
            id="hs-navbar-example"
            className={`${
              isMenuOpen ? "block" : "hidden"
            } hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:block`}
            aria-labelledby="hs-navbar-example-collapse"
          >
            <div className="flex flex-col gap-10 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  className={`font-bold ${
                    pathname === link.href
                      ? "text-blue-500"
                      : "text-gray-600 hover:text-gray-200"
                  } focus:outline-hidden`}
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
