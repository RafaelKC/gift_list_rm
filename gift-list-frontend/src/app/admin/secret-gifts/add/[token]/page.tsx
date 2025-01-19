'use client';

import {redirect, useRouter} from 'next/navigation';
import { useEffect, use, useState } from 'react';
import AddGiftForm from '../../../../../components/AddGiftForm';
import AdminGiftCard from '../../../../../components/AdminGiftCard';
import { giftService } from '../../../../../services/api';
import { Gift } from '../../../../../types/gift';

export default function SecretAddGiftPage({ params }: { params: Promise<{ token: string }> }) {
 const resolvedParams = use(params);

 const [gifts, setGifts] = useState<Gift[]>([]);
 const [loading, setLoading] = useState(true);

  if (resolvedParams.token !== 'f8e1a24b9c3d7e6a5f2n1m4k7j8h9g0') {
    console.log(resolvedParams.token);
    console.log(process.env.NEXT_ADMIN_TOKEM);
    console.log(process.env.NEXT_PUBLIC_API_URL);
    redirect('/');
  }

 const loadGifts = async () => {
   try {
     setLoading(true);
     const data = await giftService.getAllGifts();
     setGifts(data);
   } catch (err) {
     console.error('Error loading gifts:', err);
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
     loadGifts()
 }, [])

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
