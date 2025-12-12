import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg dark:shadow-purple-500/10' 
        : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            LC Filmsx
          </Link>

          {/* Desktop Menu & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-8">
            {isHomePage ? (
              <>
                {['Portfólio', 'Sobre', 'Contato'].map((item, index) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(['portfolio', 'about', 'contact'][index])}
                    className="text-gray-900 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                  >
                    {item}
                  </button>
                ))}
                <Link
                  to="/collections"
                  className="text-gray-900 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  Coleções
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-gray-900 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  Início
                </Link>
                <Link
                  to="/collections"
                  className="text-gray-900 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  Coleções
                </Link>
              </>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 shadow-md"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl dark:shadow-purple-500/20 border-t dark:border-gray-700">
            <div className="px-6 py-4 space-y-4">
              {isHomePage ? (
                <>
                  {['Portfólio', 'Sobre', 'Contato'].map((item, index) => (
                    <button
                      key={item}
                      onClick={() => scrollToSection(['portfolio', 'about', 'contact'][index])}
                      className="block w-full text-left text-gray-900 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg px-3"
                    >
                      {item}
                    </button>
                  ))}
                  <Link
                    to="/collections"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-left text-gray-900 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg px-3"
                  >
                    Coleções
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-left text-gray-900 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg px-3"
                  >
                    Início
                  </Link>
                  <Link
                    to="/collections"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-left text-gray-900 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg px-3"
                  >
                    Coleções
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;