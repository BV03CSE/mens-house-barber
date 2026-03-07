import { Outlet, Link, useLocation } from "react-router-dom";
import { Scissors, Menu, X } from "lucide-react";
import { useState } from "react";

export const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Acasă" },
    { href: "/servicii", label: "Servicii" },
    { href: "/programare", label: "Programare" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
              data-testid="nav-logo"
            >
              <Scissors className="w-6 h-6 transition-transform group-hover:rotate-45" />
              <span className="font-display text-xl tracking-wider">MEN'S HOUSE</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-12">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`nav-link uppercase text-sm tracking-widest font-medium transition-colors ${
                    isActive(link.href) ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/programare"
                className="bg-white text-black px-6 py-3 uppercase text-sm tracking-widest font-bold hover:bg-zinc-200 transition-colors"
                data-testid="nav-book-btn"
              >
                Rezervă Acum
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10">
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block uppercase text-sm tracking-widest font-medium py-2 ${
                    isActive(link.href) ? "text-white" : "text-zinc-400"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/programare"
                className="block bg-white text-black px-6 py-3 uppercase text-sm tracking-widest font-bold text-center mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Rezervă Acum
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Scissors className="w-5 h-5" />
                <span className="font-display text-lg tracking-wider">MEN'S HOUSE BARBER</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Experiența premium în îngrijirea masculină. Tradiție și eleganță.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="uppercase text-sm tracking-widest font-bold mb-4">Link-uri Rapide</h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block text-zinc-500 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="uppercase text-sm tracking-widest font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-zinc-500 text-sm">
                <p>Program: Luni - Sâmbătă</p>
                <p>09:00 - 18:00</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-zinc-600 text-sm">
            <p>© {new Date().getFullYear()} MEN'S HOUSE BARBER. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
