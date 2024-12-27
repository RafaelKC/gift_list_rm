import { useState } from 'react';
import { Gift } from '../types/gift';
import { giftService } from '../services/api';

interface SelectedGiftCardProps {
  gift: Gift;
  onDeselect: () => Promise<void>;
}

export default function SelectedGiftCard({ gift, onDeselect }: SelectedGiftCardProps) {
  const [isDeselecting, setIsDeselecting] = useState(false);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(true);

  const handleDeselect = async () => {
    setError('');
    setIsDeselecting(true);
    try {
      await onDeselect();
    } catch (err) {
      setError('Falha ao deselecionar presente');
    } finally {
      setIsDeselecting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className={`flex flex-col sm:flex-row ${gift.gift_image_url && imageLoaded ? 'gap-4' : ''} min-h-[8rem]`}>
        {gift.gift_image_url && imageLoaded && (
          <div className="w-full sm:w-32 h-32 sm:h-full flex-shrink-0">
            <img
              src={gift.gift_image_url}
              alt={gift.gift_name}
              className="w-full h-full rounded-md object-cover"
              onError={() => setImageLoaded(false)}
            />
          </div>
        )}
        <div className="flex flex-col justify-between gap-4 flex-1">
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="text-lg font-semibold break-words">{gift.gift_name}</h3>
            <p className="text-gray-600">R${gift.gift_price}</p>
            <p className="text-sm text-gray-500 mt-2 line-clamp-3">{gift.gift_description}</p>
            <a
              href={gift.gift_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-sm mt-2 block"
            >
              Ver Item
            </a>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 min-w-[120px]">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handleDeselect}
              disabled={isDeselecting}
              className="whitespace-nowrap bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeselecting ? 'Removendo...' : 'Remover Seleção'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
