'use client';

import { useEffect, useState } from 'react';
import { Gift } from '../../types/gift';
import { giftService } from '../../services/api';
import SelectedGiftCard from '../../components/SelectedGiftCard';
import EmailModal from '../../components/EmailModal';
import Link from 'next/link';

export default function SelectedGifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const loadGifts = async (email: string) => {
    try {
      setLoading(true);
      const data = await giftService.getGiftsBySelector(email);
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
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      loadGifts(savedEmail);
    } else {
      setShowEmailModal(true);
      setLoading(false);
    }
  }, []);

  const handleEmailSubmit = async (email: string) => {
    localStorage.setItem('userEmail', email);
    setShowEmailModal(false);
    loadGifts(email);
  };

  const handleDeselectGift = async (giftId: string) => {
    try {
      await giftService.updateSelector(giftId, { selector_email: '' });
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        await loadGifts(savedEmail);
      }
    } catch (err) {
      setError('Falha ao deselecionar presente');
      console.error('Error deselecting gift:', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#abd6fe] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#8bb8e8] rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white">Presentes Selecionados</h1>
            <Link
              href="/"
              className="bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Ver Lista Completa
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
              Você ainda não selecionou nenhum presente.
            </div>
          ) : (
            <div className="grid gap-6">
              {gifts.map((gift) => (
                <SelectedGiftCard
                  key={gift._id}
                  gift={gift}
                  onDeselect={() => handleDeselectGift(gift._id)}
                />
              ))}
            </div>
          )}
        </div>

        <EmailModal
          isOpen={showEmailModal}
          onClose={() => {
            if (gifts.length > 0) {
              setShowEmailModal(false);
            }
          }}
          onSubmit={handleEmailSubmit}
        />
      </div>
    </main>
  );
}
