import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  // No props needed for simplified header
}

const Header: React.FC<HeaderProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Phronos AI
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#how-it-works" 
              className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200"
            >
              How It Works
            </a>
            <a 
              href="#live-demo" 
              className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200"
            >
              Live Demo
            </a>
            <a 
              href="#why-phronos" 
              className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200"
            >
              Why Choose Us
            </a>
            <a 
              href="#contact" 
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-200 font-medium"
            >
              Watch Battles
            </a>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              <a 
                href="#how-it-works" 
                className="block text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#live-demo" 
                className="block text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Live Demo
              </a>
              <a 
                href="#why-phronos" 
                className="block text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Why Choose Us
              </a>
              <a 
                href="#contact" 
                className="block bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-200 font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Watch Battles
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;