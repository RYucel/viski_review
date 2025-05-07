import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Asterisk as Whiskey } from 'lucide-react';
import { useSupabase } from '../../lib/supabase-provider';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useSupabase();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const headerVariants = {
    top: { 
      backgroundColor: 'rgba(255, 255, 255, 0)', 
      boxShadow: 'none',
      height: '80px'
    },
    scrolled: { 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      height: '70px'
    }
  };

  const navItems = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Viskiler', path: '/whiskies' },
    { name: 'Hakkımızda', path: '/about' },
  ];

  const adminItems = [
    { name: 'Yönetim Paneli', path: '/admin/dashboard' }
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center transition-all duration-300"
      initial="top"
      animate={isScrolled ? 'scrolled' : 'top'}
      variants={headerVariants}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Whiskey size={32} className="text-primary" />
          <span className="font-serif text-2xl font-bold">VisTadım</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-base font-medium hover:text-primary transition-colors ${
                location.pathname === item.path ? 'text-primary' : 'text-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center space-x-4">
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-base font-medium hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
              >
                Çıkış Yap
              </Button>
            </div>
          ) : (
            <Link to="/admin/login">
              <Button variant="ghost" size="sm">
                Giriş Yap
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          className="absolute top-full left-0 right-0 bg-white/95 border-b border-border md:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`py-2 text-base font-medium ${
                  location.pathname === item.path ? 'text-primary' : 'text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="py-2 text-base font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => signOut()}
                >
                  Çıkış Yap
                </Button>
              </>
            ) : (
              <Link to="/admin/login" className="pt-2">
                <Button variant="primary" fullWidth>
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;