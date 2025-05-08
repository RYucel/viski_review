import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhiskyCard from '../components/whisky/WhiskyCard';
import { useWhiskies } from '../hooks/useWhiskies';

const HomePage: React.FC = () => {
  const { whiskies, loading, error } = useWhiskies();
  
  // Haftanın viskisi ve Top 5 için veri hazırlama
  const weeklyWhisky = whiskies?.find(w => w.is_whisky_of_week);
  const topWhiskies = whiskies?.filter(w => w.is_top_5).slice(0, 5);
  
  return (
    <>
      {/* 3D Glassmorphism Hero Section */}
      <section className="bg-secondary py-8 md:py-16 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 perspective-1000">
            {/* Sol Taraf - Haftanın Viskisi */}
            <motion.div 
              className="md:col-span-3 glass p-4 rounded-lg shadow-glass transform md:translate-z-0 md:-rotate-y-3 md:scale-95"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="font-serif text-xl font-bold mb-3">Haftanın Viskisi</h2>
              {weeklyWhisky ? (
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 mb-3">
                    <img 
                      src={weeklyWhisky.image_url} 
                      alt={weeklyWhisky.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="font-serif text-lg font-semibold">{weeklyWhisky.name}</h3>
                  <div className="flex items-center mt-2">
                    <Star className="text-primary w-5 h-5 mr-1" fill="currentColor" />
                    <span className="font-medium">{weeklyWhisky.overall_rating}/100</span>
                  </div>
                  <Link 
                    to={`/whiskies/${weeklyWhisky.id}`}
                    className="mt-3 text-primary hover:underline text-sm flex items-center"
                  >
                    Detaylar <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Yükleniyor...</p>
              )}
            </motion.div>
            
            {/* Orta Kısım - Ana Başlık ve Arama (3D Öne Çıkan Kart) */}
            <motion.div 
              className="md:col-span-6 glass-premium p-6 rounded-lg shadow-glass-strong transform md:translate-z-12 md:scale-105 z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">İmge ve Rüştü ile Viski Dünyasına Yolculuk</h1>
                <p className="text-foreground/80 mb-6">
                  Sizlere en özel viskileri tanıtıyor, lezzet notalarını paylaşıyor ve kişisel değerlendirmelerimizle bu eşsiz deneyimi sizinle buluşturuyoruz. Her damla bir hikaye, her yudum bir keşif!
                </p>
                
                {/* Arama Kutusu */}
                <div className="relative max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Viski adı, damıtımevi veya menşei ara..."
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-input bg-background/70 backdrop-blur-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
              </div>
            </motion.div>
            
            {/* Sağ Taraf - Top 5 */}
            <motion.div 
              className="md:col-span-3 glass p-4 rounded-lg shadow-glass transform md:translate-z-0 md:rotate-y-3 md:scale-95"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="font-serif text-xl font-bold mb-3">Top 5 Viski</h2>
              {topWhiskies ? (
                <ul className="space-y-2">
                  {topWhiskies.map((whisky, index) => (
                    <li key={whisky.id} className="flex items-center">
                      <span className="font-bold text-primary mr-2">{index + 1}.</span>
                      <Link 
                        to={`/whiskies/${whisky.id}`}
                        className="hover:text-primary transition-colors truncate"
                      >
                        {whisky.name}
                      </Link>
                      <span className="ml-auto text-sm font-medium">{whisky.overall_rating}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center">Yükleniyor...</p>
              )}
              <Link 
                to="/whiskies"
                className="mt-4 text-primary hover:underline text-sm flex items-center justify-end"
              >
                Tüm Viskileri Gör <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Viski Kartları Bölümü */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl font-bold">Son Eklenen Viskiler</h2>
            <Link 
              to="/whiskies"
              className="text-primary hover:underline flex items-center"
            >
              Tüm Viskileri Gör <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <p className="text-center py-12">Viskiler yükleniyor...</p>
          ) : error ? (
            <p className="text-center py-12 text-destructive">Bir hata oluştu: {error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {whiskies?.slice(0, 8).map(whisky => (
                <WhiskyCard key={whisky.id} whisky={whisky} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Kategoriler Bölümü */}
      <section className="py-8 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">Viski Kategorileri</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['İskoç', 'Bourbon', 'İrlanda', 'Japon'].map(category => (
              <Link 
                key={category}
                to={`/whiskies?type=${category}`}
                className="bg-card hover:bg-card/80 transition-colors p-4 rounded-lg text-center shadow-sm"
              >
                <h3 className="font-serif font-semibold">{category} Viskisi</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;