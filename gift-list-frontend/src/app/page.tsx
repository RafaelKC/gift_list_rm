'use client';

import { useEffect, useState } from 'react';
import { Gift } from '../types/gift';
import { giftService } from '../services/api';
import GiftCard from '../components/GiftCard';
import EmailModal from '../components/EmailModal';
import Link from 'next/link';

export default function Home() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingGiftId, setPendingGiftId] = useState<string | null>(null);

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
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) {
      setPendingGiftId(giftId);
      setShowEmailModal(true);
      return;
    }

    try {
      await giftService.updateSelector(giftId, { selector_email: savedEmail });
      await loadGifts();
    } catch (err) {
      setError('Falha ao selecionar presente');
      console.error('Error selecting gift:', err);
    }
  };

  const handleEmailSubmit = async (email: string) => {
    localStorage.setItem('userEmail', email);
    setShowEmailModal(false);

    if (pendingGiftId) {
      try {
        await giftService.updateSelector(pendingGiftId, { selector_email: email });
        await loadGifts();
        setPendingGiftId(null);
      } catch (err) {
        setError('Falha ao selecionar presente');
        console.error('Error selecting gift:', err);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#abd6fe] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <div className="w-48 h-48 bg-white rounded-full shadow-lg flex items-center justify-center p-4">
            <svg
              className="w-full h-full text-[#8bb8e8]"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
            </svg>
          </div>
        </div>
        <div className="bg-[#8bb8e8] rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white">Lista de Presentes</h1>
            <Link
              href="/presentes-selecionados"
              className="bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Presentes Selecionados
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-white">Carregando presentes...</div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-12 text-white">
              Nenhum presente disponível.
            </div>
          ) : (
            <div className="grid gap-6">
              {gifts.map((gift) => (
                <GiftCard
                  key={gift._id}
                  gift={gift}
                  onSelect={() => handleSelectGift(gift._id)}
                />
              ))}
            </div>
          )}
        </div>
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setPendingGiftId(null);
          }}
          onSubmit={handleEmailSubmit}
        />
      </div>
    </main>
  );
}
