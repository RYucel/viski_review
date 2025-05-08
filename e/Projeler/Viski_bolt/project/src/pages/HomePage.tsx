// ... existing code ...
import React, { useState, useEffect } from 'react'; // useEffect zaten vardı, useState ekledik
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate ekledik
import WhiskyCard from '../components/whisky/WhiskyCard';
// ... existing code ...

const HomePage: React.FC = () => {
  const { whiskies, loading, error } = useWhiskies();
  const [popularCategories, setPopularCategories] = useState<WhiskyType[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Arama terimi için state
  const navigate = useNavigate(); // Yönlendirme için hook

  // Haftanın viskisi ve Top 5 için veri hazırlama
// ... existing code ...
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/whiskies?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      {/* 3D Glassmorphism Hero Section */}
// ... existing code ...
                <p className="text-foreground/80 mb-6">
                  Sizlere en özel viskileri tanıtıyor, lezzet notalarını paylaşıyor ve kişisel değerlendirmelerimizle bu eşsiz deneyimi sizinle buluşturuyoruz. Her damla bir hikaye, her yudum bir keşif!
                </p>
                
                {/* Arama Kutusu */}
                <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Viski adı, damıtımevi veya menşei ara..."
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-input bg-background/70 backdrop-blur-sm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  {/* Arama butonunu gizli tutabiliriz, form gönderimi Enter ile çalışacaktır */}
                  <button type="submit" className="hidden"></button>
                </form>
              </div>
            </motion.div>
            
            {/* Sağ Taraf - Top 5 */}
// ... existing code ...