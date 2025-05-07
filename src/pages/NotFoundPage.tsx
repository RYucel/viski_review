import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6 text-primary">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mx-auto"
          >
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="17" x2="12" y2="17" />
          </svg>
        </div>
        <h1 className="font-serif text-4xl font-bold mb-4">Sayfa Bulunamadı</h1>
        <p className="text-foreground/70 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. Ana sayfaya dönerek gezinmeye devam edebilirsiniz.
        </p>
        <Link to="/">
          <Button variant="primary" icon={<Home size={16} />}>
            Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;