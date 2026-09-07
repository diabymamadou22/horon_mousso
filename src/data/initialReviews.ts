import { ProductReview } from '../types';

export const initialReviews: ProductReview[] = [
  {
    id: 'rev_1',
    productId: 'prod_soumbala',
    productName: 'Soumbala Pur de Néré Artisanal (Grand Cru)',
    customerName: 'Chef Amadou Traoré',
    rating: 5,
    location: 'Restaurant Le Savoureux, Bamako ACI',
    comment: 'Le meilleur soumbala que j’ai utilisé en cuisine professionnelle. L’odeur est subtile sans être agressive, et le goût umami dans la sauce graine et le tchep est exceptionnel. Aucun grain de sable.',
    isVerifiedPurchase: true,
    createdAt: '2025-02-28T14:20:00Z'
  },
  {
    id: 'rev_2',
    productId: 'prod_1',
    productName: 'Piment Rouge Extra Fort en Poudre',
    customerName: 'Fatoumata D.',
    rating: 5,
    location: 'Hamdallaye, Bamako',
    comment: 'Piment d’une pureté rare ! Une demi-cuillère suffit pour relever toute une marmite. La couleur est d’un beau rouge naturel, on sent tout de suite qu’il n’y a aucun colorant chimique.',
    isVerifiedPurchase: true,
    createdAt: '2025-03-01T09:15:00Z'
  },
  {
    id: 'rev_3',
    productId: 'prod_soumbala',
    productName: 'Soumbala Pur de Néré Artisanal (Grand Cru)',
    customerName: 'Mariam Coulibaly',
    rating: 5,
    location: 'Badalabougou, Bamako',
    comment: 'Enfin un soumbala propre et prêt à l’emploi ! Le conditionnement en pot hermétique est très hygiénique et garde l’arôme intact plusieurs mois.',
    isVerifiedPurchase: true,
    createdAt: '2025-03-02T16:40:00Z'
  },
  {
    id: 'rev_4',
    productId: 'prod_3',
    productName: 'Gingembre Pur en Poudre (Qualité Grand Arôme)',
    customerName: 'Dr. Ousmane Diakité',
    rating: 5,
    location: 'Sikasso',
    comment: 'Utilisé à la fois en infusion matinale avec du miel et pour nos marinades de poulet braisé. Le parfum est intense et la fraîcheur est remarquable.',
    isVerifiedPurchase: true,
    createdAt: '2025-03-03T11:05:00Z'
  },
  {
    id: 'rev_5',
    productId: 'prod_5',
    productName: 'Mélange d’Épices Spécial Grillades & Sauces',
    customerName: 'Kadiatou B.',
    rating: 5,
    location: 'Faladié, Bamako',
    comment: 'Ce mélange m’a fait jeter tous mes cubes industriels. C’est savoureux, sain et les enfants adorent. Bravo Horon Mousso pour cette qualité digne du terroir !',
    isVerifiedPurchase: true,
    createdAt: '2025-03-04T18:30:00Z'
  },
  {
    id: 'rev_6',
    productId: 'prod_4',
    productName: 'Curcuma Pur en Poudre (Riche en Curcumine)',
    customerName: 'Salif Sanogo',
    rating: 5,
    location: 'Koulikoro',
    comment: 'Curcuma d’une couleur or éclatante et très puissant. Très bon rapport qualité-prix.',
    isVerifiedPurchase: true,
    createdAt: '2025-03-05T13:10:00Z'
  }
];
