import { Order } from '../types';

export const initialOrders: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'HM-2026-0048',
    customerName: 'Aïssata Diallo',
    customerPhone: '+223 76 45 88 12',
    customerEmail: 'aissata.diallo@gmail.com',
    deliveryAddress: 'Hamdallaye ACI 2000, près du rond-point de l’Obélisque',
    deliveryZone: 'Bamako • Rive Gauche (ACI 2000, Hamdallaye, Quinzambougou, Darsalam)',
    deliveryFee: 1000,
    deliveryType: 'livraison',
    paymentMethod: 'orange_money',
    paymentStatus: 'paye',
    status: 'en_livraison',
    items: [
      {
        productId: 'prod_soumbala',
        productName: 'Soumbala Pur de Néré Artisanal (Grand Cru)',
        format: 'Pot hermétique 250g',
        quantity: 2,
        unitPrice: 2500,
        totalPrice: 5000
      },
      {
        productId: 'prod_1',
        productName: 'Piment Rouge Extra Fort en Poudre',
        format: 'Flacon saupoudreur 100g',
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500
      }
    ],
    subtotal: 6500,
    total: 7500,
    notes: 'Livrer avant 14h SVP, appeler à l’arrivée devant l’immeuble.',
    createdAt: '2026-03-06T10:15:00Z',
    updatedAt: '2026-03-06T11:00:00Z'
  },
  {
    id: 'ord_2',
    orderNumber: 'HM-2026-0049',
    customerName: 'Moussa Konaté (Traiteur Terroir)',
    customerPhone: '+223 66 12 90 44',
    customerEmail: 'moussa.traiteur@yahoo.fr',
    deliveryAddress: 'Badalabougou SEMA, Rue 12 porte 45',
    deliveryZone: 'Bamako • Rive Droite (Badalabougou, Baco-Djicoroni, Faladié, Torokorobougou)',
    deliveryFee: 1500,
    deliveryType: 'livraison',
    paymentMethod: 'wave',
    paymentStatus: 'paye',
    status: 'en_preparation',
    items: [
      {
        productId: 'prod_soumbala',
        productName: 'Soumbala Pur de Néré Artisanal (Grand Cru)',
        format: 'Boules traditionnelles 500g',
        quantity: 4,
        unitPrice: 4500,
        totalPrice: 18000
      },
      {
        productId: 'prod_5',
        productName: 'Mélange d’Épices Spécial Grillades & Sauces',
        format: 'Sachet économique 500g',
        quantity: 3,
        unitPrice: 3500,
        totalPrice: 10500
      },
      {
        productId: 'prod_3',
        productName: 'Gingembre Pur en Poudre (Qualité Grand Arôme)',
        format: 'Sachet hermétique 250g',
        quantity: 2,
        unitPrice: 2000,
        totalPrice: 4000
      }
    ],
    subtotal: 32500,
    total: 34000,
    notes: 'Commande pour un buffet de mariage ce week-end.',
    createdAt: '2026-03-06T14:30:00Z'
  },
  {
    id: 'ord_3',
    orderNumber: 'HM-2026-0050',
    customerName: 'Salimata Bamba',
    customerPhone: '+223 79 33 21 00',
    deliveryAddress: 'Atelier Horon Mousso (Retrait direct)',
    deliveryZone: 'Retrait en boutique / Atelier Horon Mousso (Gratuit)',
    deliveryFee: 0,
    deliveryType: 'retrait',
    paymentMethod: 'especes_livraison',
    paymentStatus: 'en_attente',
    status: 'en_attente',
    items: [
      {
        productId: 'prod_4',
        productName: 'Curcuma Pur en Poudre (Riche en Curcumine)',
        format: 'Pot 200g',
        quantity: 1,
        unitPrice: 1800,
        totalPrice: 1800
      },
      {
        productId: 'prod_7',
        productName: 'Ail Déshydraté Concassé & Moulu',
        format: 'Flacon 100g',
        quantity: 2,
        unitPrice: 1500,
        totalPrice: 3000
      }
    ],
    subtotal: 4800,
    total: 4800,
    notes: 'Je passerai récupérer vers 17h.',
    createdAt: '2026-03-07T08:20:00Z'
  }
];
