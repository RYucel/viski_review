import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Award, Bookmark, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import { useSupabase } from '../../lib/supabase-provider';
import { Whisky } from '../../types/whisky';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const [whiskies, setWhiskies] = useState<Whisky[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingWeeklyWhisky, setIsUpdatingWeeklyWhisky] = useState(false);
  const [isUpdatingTop5, setIsUpdatingTop5] = useState(false);
  const [selectedWhisky, setSelectedWhisky] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const { user } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else {
      fetchWhiskies();
    }
  }, [user, navigate]);

  const fetchWhiskies = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('whiskies')
        .select(`
          *,
          origin:origin_id(id, name),
          region:region_id(id, name, origin_id),
          type:type_id(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedWhiskies = data.map(whisky => ({
          ...whisky,
          aromatic_profile: {
            body: whisky.body_rating,
            richness: whisky.richness_rating,
            sweetness: whisky.sweetness_rating,
            smokiness: whisky.smokiness_rating,
            finish: whisky.finish_rating,
          },
          flavor_tags: [],
        })) as Whisky[];
        
        setWhiskies(formattedWhiskies);
      }
    } catch (error) {
      console.error('Error fetching whiskies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu viski değerlendirmesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      setIsDeleting(true);
      setSelectedWhisky(id);
      
      try {
        // First delete flavor tags relations
        await supabase
          .from('whisky_flavor_tags')
          .delete()
          .eq('whisky_id', id);
        
        // Then delete the whisky
        const { error } = await supabase
          .from('whiskies')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        setWhiskies(whiskies.filter(whisky => whisky.id !== id));
      } catch (error) {
        console.error('Error deleting whisky:', error);
        alert('Viski silinirken bir hata oluştu.');
      } finally {
        setIsDeleting(false);
        setSelectedWhisky(null);
      }
    }
  };

  const handleSetWhiskyOfWeek = async (id: string) => {
    setIsUpdatingWeeklyWhisky(true);
    setSelectedWhisky(id);
    
    try {
      // First reset all whiskies
      await supabase
        .from('whiskies')
        .update({ is_whisky_of_week: false })
        .neq('id', 'non-existent-id');
      
      // Then set the selected whisky as whisky of the week
      const { error } = await supabase
        .from('whiskies')
        .update({ is_whisky_of_week: true })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setWhiskies(whiskies.map(whisky => ({
        ...whisky,
        is_whisky_of_week: whisky.id === id
      })));
      
      alert(`"${whiskies.find(w => w.id === id)?.name}" haftanın viskisi olarak ayarlandı.`);
    } catch (error) {
      console.error('Error setting whisky of the week:', error);
      alert('Haftanın viskisi ayarlanırken bir hata oluştu.');
    } finally {
      setIsUpdatingWeeklyWhisky(false);
      setSelectedWhisky(null);
    }
  };

  const handleToggleTop5 = async (id: string) => {
    setIsUpdatingTop5(true);
    setSelectedWhisky(id);
    
    try {
      const whisky = whiskies.find(w => w.id === id);
      if (!whisky) return;
      
      const newTop5Value = !whisky.is_top_5;
      
      // If adding to top 5, check if we already have 5 whiskies
      if (newTop5Value) {
        const currentTop5Count = whiskies.filter(w => w.is_top_5).length;
        if (currentTop5Count >= 5) {
          if (!window.confirm('Zaten 5 viski Top 5 listesinde. Başka bir viski çıkarmak için devam etmek istiyor musunuz?')) {
            setIsUpdatingTop5(false);
            setSelectedWhisky(null);
            return;
          }
        }
      }
      
      const { error } = await supabase
        .from('whiskies')
        .update({ is_top_5: newTop5Value })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setWhiskies(whiskies.map(whisky => 
        whisky.id === id 
          ? { ...whisky, is_top_5: newTop5Value } 
          : whisky
      ));
      
      const actionText = newTop5Value ? 'eklendi' : 'çıkarıldı';
      alert(`"${whisky.name}" Top 5 listesine ${actionText}.`);
    } catch (error) {
      console.error('Error toggling top 5 status:', error);
      alert('Top 5 durumu güncellenirken bir hata oluştu.');
    } finally {
      setIsUpdatingTop5(false);
      setSelectedWhisky(null);
    }
  };

  const filteredWhiskies = whiskies.filter(whisky => {
    const matchesSearch = whisky.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (whisky.distillery && whisky.distillery.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterValue === 'all') return matchesSearch;
    if (filterValue === 'whisky-of-week') return matchesSearch && whisky.is_whisky_of_week;
    if (filterValue === 'top-5') return matchesSearch && whisky.is_top_5;
    
    return matchesSearch;
  });

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="font-serif text-3xl font-bold mb-4 md:mb-0">Yönetim Paneli</h1>
          <Link to="/admin/whiskies/new">
            <Button variant="primary" icon={<Plus size={16} />}>
              Yeni Viski Ekle
            </Button>
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Viski adı veya damıtımevi ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              />
            </div>
            <div>
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="all">Tüm Viskiler</option>
                <option value="whisky-of-week">Haftanın Viskisi</option>
                <option value="top-5">Top 5</option>
              </select>
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchWhiskies}
                icon={<RefreshCw size={16} />}
              >
                Yenile
              </Button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredWhiskies.length === 0 ? (
          <div className="bg-muted p-8 rounded-lg text-center">
            <h3 className="font-serif text-xl font-semibold mb-2">Viski Bulunamadı</h3>
            <p className="text-foreground/70 mb-4">
              {searchQuery || filterValue !== 'all' 
                ? 'Arama veya filtreleme kriterlerinize uygun viski bulunamadı.' 
                : 'Henüz viski değerlendirmesi eklenmemiş.'}
            </p>
            {(searchQuery || filterValue !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterValue('all');
                }}
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-4 py-3 text-left text-sm font-medium">Viski</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Tür</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Menşei</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Puan</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Durum</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWhiskies.map((whisky) => (
                    <tr key={whisky.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{whisky.name}</p>
                          {whisky.distillery && (
                            <p className="text-xs text-foreground/70">{whisky.distillery}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{whisky.type?.name}</td>
                      <td className="px-4 py-3 text-sm">{whisky.origin?.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${
                          whisky.overall_rating >= 90 ? 'text-emerald-600' :
                          whisky.overall_rating >= 80 ? 'text-green-600' :
                          whisky.overall_rating >= 70 ? 'text-lime-600' :
                          whisky.overall_rating >= 60 ? 'text-amber-600' :
                          whisky.overall_rating >= 50 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {whisky.overall_rating}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center space-x-1">
                          {whisky.is_whisky_of_week && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground">
                              <Award size={10} className="mr-1" />
                              Haftanın Viskisi
                            </span>
                          )}
                          {whisky.is_top_5 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent text-accent-foreground">
                              <Bookmark size={10} className="mr-1" />
                              Top 5
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          {/* Set as Whisky of Week */}
                          <button
                            onClick={() => handleSetWhiskyOfWeek(whisky.id)}
                            disabled={isUpdatingWeeklyWhisky && selectedWhisky === whisky.id}
                            className={`p-1.5 rounded-md ${
                              whisky.is_whisky_of_week
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary hover:bg-secondary/80'
                            }`}
                            title={whisky.is_whisky_of_week ? 'Şu anki Haftanın Viskisi' : 'Haftanın Viskisi Olarak Ayarla'}
                          >
                            {isUpdatingWeeklyWhisky && selectedWhisky === whisky.id ? (
                              <span className="animate-spin">
                                <RefreshCw size={16} />
                              </span>
                            ) : (
                              <Award size={16} />
                            )}
                          </button>
                          
                          {/* Toggle Top 5 */}
                          <button
                            onClick={() => handleToggleTop5(whisky.id)}
                            disabled={isUpdatingTop5 && selectedWhisky === whisky.id}
                            className={`p-1.5 rounded-md ${
                              whisky.is_top_5
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-secondary hover:bg-secondary/80'
                            }`}
                            title={whisky.is_top_5 ? 'Top 5\'ten Çıkar' : 'Top 5\'e Ekle'}
                          >
                            {isUpdatingTop5 && selectedWhisky === whisky.id ? (
                              <span className="animate-spin">
                                <RefreshCw size={16} />
                              </span>
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </button>
                          
                          {/* Edit */}
                          <Link
                            to={`/admin/whiskies/${whisky.id}/edit`}
                            className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80"
                            title="Düzenle"
                          >
                            <Edit size={16} />
                          </Link>
                          
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(whisky.id)}
                            disabled={isDeleting && selectedWhisky === whisky.id}
                            className="p-1.5 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive"
                            title="Sil"
                          >
                            {isDeleting && selectedWhisky === whisky.id ? (
                              <span className="animate-spin">
                                <RefreshCw size={16} />
                              </span>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;