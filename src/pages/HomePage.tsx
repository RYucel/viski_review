import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhiskyCard from '../components/whisky/WhiskyCard';
import { useWhiskies } from '../hooks/useWhiskies';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-client';
import { WhiskyType } from '../types/whisky'; // WhiskyType tanımınızın doğru olduğundan emin olun

const HomePage: React.FC = () => {
  const { whiskies, loading, error } = useWhiskies();
  const [popularCategories, setPopularCategories] = useState<WhiskyType[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Haftanın viskisi ve Top 5 için veri hazırlama
  const weeklyWhisky = whiskies?.find(w => w.is_whisky_of_week);
  const topWhiskies = whiskies?.filter(w => w.is_top_5).slice(0, 5);

  useEffect(() => {
    const fetchPopularCategories = async () => {
      setCategoriesLoading(true);
      // Veritabanından tüm 'types' tablosundaki kategorileri çek, isme göre sırala
      const { data, error: fetchError } = await supabase
        .from('types')
        .select('id, name')
        .order('name', { ascending: true }); // Alfabetik sıralama eklendi

      // Veritabanından ne geldiğini görmek için bu satırı geçici olarak açabilirsiniz:
      // console.log('Supabase\'den çekilen kategori verisi:', data);
      // console.log('Kategori çekme hatası:', fetchError);

      if (fetchError) {
        console.error('Popüler kategoriler çekilirken hata oluştu:', fetchError);
        setPopularCategories([]); // Hata durumunda boş dizi ata
        setCategoriesLoading(false);
        return;
      }

      if (data) {
        // Gelen veriyi doğrudan ata. WhiskyType tipine cast ediyoruz.
        setPopularCategories(data as WhiskyType[]);
      } else {
        // data null ise (beklenmedik bir durum, fetchError null ise data genelde array olur)
        setPopularCategories([]);
      }
      setCategoriesLoading(false);
    };

    fetchPopularCategories();
  }, []);

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
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : weeklyWhisky ? (
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
                <p className="text-center py-4">Haftanın viskisi bulunamadı</p>
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
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : topWhiskies && topWhiskies.length > 0 ? (
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
                <p className="text-center py-4">Top 5 listesi bulunamadı</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {whiskies?.slice(0, 10).map(whisky => (
                <WhiskyCard key={whisky.id} whisky={whisky} priority={true} />
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
            {categoriesLoading ? (
              <p className="text-center col-span-full">Kategoriler yükleniyor...</p>
            ) : popularCategories.length > 0 ? (
              popularCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/whiskies?types=${category.id}`} // Bu link yapısı filtrelemeyi sağlamalı
                  className="group block bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-serif text-lg font-semibold text-center group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </motion.div>
                </Link>
              ))
            ) : (
              <p className="text-center col-span-full">Kategori bulunamadı.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;