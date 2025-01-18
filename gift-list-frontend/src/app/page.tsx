'use client';

import { useEffect, useState } from 'react';
import { Gift } from '../types/gift';
import { giftService } from '../services/api';
import GiftCard from '../components/GiftCard';
import EmailModal from '../components/EmailModal';
import Link from 'next/link';
import Image from 'next/image';

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
          <div className="w-64 h-64 relative">
            <Image
              src="/images/logo.jpg"
              alt="Logo"
              fill
              className="object-contain"
              priority
              sizes="256px"
            />
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
