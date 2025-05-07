import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useSupabase } from '../../lib/supabase-provider';
import Button from '../../components/ui/Button';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signIn } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-md p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Lock size={24} />
            </div>
          </div>
          
          <h1 className="font-serif text-2xl font-bold text-center mb-6">Yönetici Girişi</h1>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Adresi
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              fullWidth
            >
              Giriş Yap
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;