import React from 'react';
import { Link } from 'react-router-dom';
import { Asterisk as Whiskey, Github, Mail, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Whiskey size={28} className="text-primary" />
              <span className="font-serif text-xl font-bold">VisTadım</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Viski tutkunlarına özel, kişisel değerlendirmeler ve notlar içeren bir platform. Burada içtiğim viskilerin tadım notlarını ve değerlendirmelerimi sizlerle paylaşıyorum.
            </p>
          </div>
          
          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold mb-4">Sayfalar</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-foreground/80 hover:text-primary transition">Ana Sayfa</Link>
              <Link to="/whiskies" className="text-foreground/80 hover:text-primary transition">Viskiler</Link>
              <Link to="/about" className="text-foreground/80 hover:text-primary transition">Hakkımda</Link>
            </nav>
          </div>
          
          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold mb-4">İletişim</h3>
            <div className="flex flex-col space-y-2">
              <a 
                href="mailto:info@vistadam.com" 
                className="text-foreground/80 hover:text-primary transition flex items-center space-x-2"
              >
                <Mail size={16} />
                <span>info@vistadam.com</span>
              </a>
              <a 
                href="https://twitter.com/vistadam" 
                className="text-foreground/80 hover:text-primary transition flex items-center space-x-2"
              >
                <Twitter size={16} />
                <span>@vistadam</span>
              </a>
              <a 
                href="https://github.com/vistadam" 
                className="text-foreground/80 hover:text-primary transition flex items-center space-x-2"
              >
                <Github size={16} />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-border/60 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} VisTadım. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;