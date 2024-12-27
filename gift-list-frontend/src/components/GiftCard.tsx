import { useState } from 'react';
import { Gift } from '../types/gift';
import { giftService } from '../services/api';

interface GiftCardProps {
  gift: Gift;
  onSelect: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function GiftCard({ gift, onSelect, onDelete }: GiftCardProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(true);

  const handleSelect = async () => {
    setError('');
    setIsSelecting(true);
    try {
      await onSelect();
    } catch (err) {
      setError('Falha ao selecionar presente');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      setError('Falha ao excluir presente');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className={`flex ${gift.gift_image_url && imageLoaded ? 'gap-4' : ''} min-h-[8rem]`}>
        {gift.gift_image_url && imageLoaded && (
          <div className="w-32 h-full flex-shrink-0">
            <img
              src={gift.gift_image_url}
              alt={gift.gift_name}
              className="w-full h-full rounded-md object-cover"
              onError={() => setImageLoaded(false)}
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between gap-4 flex-1">
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
            {!gift.selector_email ? (
              <button
                onClick={handleSelect}
                disabled={isSelecting}
                className={`whitespace-nowrap bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelecting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSelecting ? 'Selecionando...' : 'Selecionar Presente'}
              </button>
            ) : (
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Selecionado por: {gift.selector_email}
              </span>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`text-red-500 hover:text-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
