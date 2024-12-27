'use client';

import { useRouter } from 'next/navigation';
import { useEffect, use, useState } from 'react';
import AddGiftForm from '../../../../../components/AddGiftForm';
import AdminGiftCard from '../../../../../components/AdminGiftCard';
import { giftService } from '../../../../../services/api';
import { Gift } from '../../../../../types/gift';

const VALID_TOKEN = process.env.ADMIN_TOKEM

export default function SecretAddGiftPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGifts = async () => {
    try {
      setLoading(true);
      const data = await giftService.getAllGifts();
      setGifts(data);
      setError('');
    } catch (err) {
      setError('Falha ao carregar presentes');
      console.error('Error loading gifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedParams.token !== VALID_TOKEN) {
      router.push('/');
    } else {
      loadGifts();
    }
  }, [resolvedParams.token, router]);

  if (resolvedParams.token !== VALID_TOKEN) {
    return null;
  }

  const handleAddGift = async (giftData: any) => {
    try {
      await giftService.createGift(giftData);
      await loadGifts();
    } catch (err) {
      console.error('Error adding gift:', err);
      throw err;
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    try {
      await giftService.deleteGift(giftId);
      await loadGifts();
    } catch (err) {
      console.error('Error deleting gift:', err);
      throw err;
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel Administrativo de Presentes</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Adicionar Novo Presente</h2>
          <AddGiftForm onSubmit={handleAddGift} />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lista de Todos os Presentes</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Carregando presentes...</div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum presente disponível.
            </div>
          ) : (
            <div className="space-y-4">
              {gifts.map((gift) => (
                <AdminGiftCard
                  key={gift._id}
                  gift={gift}
                  onDelete={() => handleDeleteGift(gift._id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
