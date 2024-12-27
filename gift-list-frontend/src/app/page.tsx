'use client';

import { useEffect, useState } from 'react';
import { Gift } from '../types/gift';
import { giftService } from '../services/api';
import GiftCard from '../components/GiftCard';
import AddGiftForm from '../components/AddGiftForm';

export default function Home() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGifts = async () => {
    try {
      setLoading(true);
      const data = await giftService.getAvailableGifts();
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
    loadGifts();
  }, []);

  const handleAddGift = async (giftData: Omit<Gift, '_id'>) => {
    try {
      await giftService.createGift(giftData);
      await loadGifts();
    } catch (err) {
      setError('Falha ao adicionar presente');
      console.error('Error adding gift:', err);
    }
  };

  const handleSelectGift = async (giftId: string) => {
    if (!email.trim()) {
      alert('Por favor, digite seu email primeiro');
      return;
    }

    try {
      await giftService.updateSelector(giftId, { selector_email: email });
      await loadGifts();
    } catch (err) {
      setError('Falha ao selecionar presente');
      console.error('Error selecting gift:', err);
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    try {
      await giftService.deleteGift(giftId);
      await loadGifts();
    } catch (err) {
      setError('Falha ao excluir presente');
      console.error('Error deleting gift:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Lista de Presentes</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seu Email (necessário para selecionar presentes)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            className="w-full max-w-md px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <AddGiftForm onSubmit={handleAddGift} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Carregando presentes...</div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum presente disponível. Adicione alguns presentes para começar!
          </div>
        ) : (
          <div className="space-y-4">
            {gifts.map((gift) => (
              <GiftCard
                key={gift._id}
                gift={gift}
                onSelect={() => handleSelectGift(gift._id)}
                onDelete={() => handleDeleteGift(gift._id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
