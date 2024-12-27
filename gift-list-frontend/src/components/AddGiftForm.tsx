import { useState } from 'react';
import { GiftCreate } from '../types/gift';
import { fetchProductDetails } from '../services/product-details';

interface AddGiftFormProps {
  onSubmit: (gift: GiftCreate) => Promise<void>;
}

export default function AddGiftForm({ onSubmit }: AddGiftFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<GiftCreate>({
    gift_name: '',
    gift_link: '',
    gift_price: 0,
    gift_description: '',
    gift_image_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setError('');
      setFormData({
        gift_name: '',
        gift_link: '',
        gift_price: 0,
        gift_description: '',
        gift_image_url: '',
      });
    } catch (error) {
      setError('Falha ao adicionar presente. Por favor, tente novamente.');
      console.error('Error adding gift:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'gift_price' ? parseFloat(value) || 0 : value,
    }));

    // Try to fetch metadata for any valid URL
    if (name === 'gift_link' && value && value.startsWith('http')) {
      setIsLoadingProduct(true);
      setError('');
      try {
        const productDetails = await fetchProductDetails(value);
        setFormData(prev => ({
          ...prev,
          gift_name: productDetails.title || prev.gift_name,
          gift_price: productDetails.price || prev.gift_price,
          gift_description: productDetails.description || prev.gift_description,
          gift_image_url: productDetails.image || prev.gift_image_url,
        }));
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        // Don't show error to user, silently fail as this is an enhancement
      } finally {
        setIsLoadingProduct(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Link do Presente
          </label>
          <div className="relative">
            <input
              type="url"
              name="gift_link"
              value={formData.gift_link}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Cole o link do produto aqui (qualquer loja online)..."
            />
            {isLoadingProduct && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome do Presente
          </label>
          <input
            type="text"
            name="gift_name"
            value={formData.gift_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preço</label>
          <input
            type="number"
            name="gift_price"
            value={formData.gift_price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL da Imagem (opcional)
          </label>
          <input
            type="url"
            name="gift_image_url"
            value={formData.gift_image_url}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            name="gift_description"
            value={formData.gift_description}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Adicionando...' : 'Adicionar Presente'}
          </button>
        </div>
      </form>
    </div>
  );
}
