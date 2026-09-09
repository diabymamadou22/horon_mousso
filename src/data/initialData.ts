import { CompanySettings, Product, Announcement, MediaItem, CustomerMessage } from '../types';

export const initialSettings: CompanySettings = {
  id: 'settings_main',
  companyName: 'Horon Mousso',
  logo: '/logo.png',
  slogan: 'L’art et la noblesse des épices du terroir, transformées avec excellence et pureté.',
  shortDescription: 'Entreprise agroalimentaire spécialisée dans la sélection, la transformation saine et le conditionnement d\'épices d\'exception, soumbala pur, piments séchés et produits agricoles authentiques.',
  phone: '+223 70 12 34 56',
  whatsapp: '+22370123456',
  email: 'contact@horonmousso.com',
  address: 'Atelier de Transformation & Boutique, Quartier Artisanal du Terroir',
  cityCountry: 'Bamako & Abidjan, Afrique de l’Ouest',
  openingHours: 'Du Lundi au Samedi : 08h00 – 18h30',
  heroImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1920&q=80',
  heroVideo: '',
  qualityCommitment: 'Nos épices et piments sont soigneusement triés à la main, séchés au séchoir hygiénique thermorégulé et broyés sans colorant, sans glutamate de synthèse ni conservateur chimique. 100% naturel.',
  producersCommitment: 'Collaboration étroite et solidaire avec les groupements de femmes artisanes et les coopératives paysannes locales, garantissant un prix d\'achat équitable et une valorisation directe du travail féminin rural.',
  mission: 'Démocratiser l\'accès à des épices saines, authentiques et prêtes à l\'emploi tout en valorisant le génie culinaire et agricole du terroir ouest-africain.',
  vision: 'Être la marque de référence en Afrique et dans la diaspora pour les épices nobles, soumbala d\'excellence et condiments du terroir, conjuguant tradition et normes internationales.',
  waveNumber: '+223 70 12 34 56',
  orangeMoneyNumber: '+223 70 12 34 56',
  moovMoneyNumber: '+223 60 12 34 56',
  paymentInstructions: 'Paiement sécurisé accepté via Wave, Orange Money, Moov Money, ou en espèces à la livraison / au retrait en atelier.'
};

export const initialProducts: Product[] = [
  {
    id: 'prod_soumbala',
    name: 'Soumbala Pur de Néré Artisanal (Grand Cru)',
    category: 'produits_transformes',
    description: 'Grain de néré noble fermenté et séché selon la tradition, sans aucun cube chimique. Arôme profond et umami authentique.',
    fullDescription: 'Le Soumbala Horon Mousso est préparé avec des graines de néré sélectionnées par nos groupements de femmes artisanes. Fermentation surveillée, séchage hygiénique et désodorisation douce pour révéler toute la subtilité de cette épice d\'or noir ouest-africaine. Riche en fer, protéines et minéraux, il sublime vos sauces feuille, riz gras, soupe de poisson et marinades.',
    price: '2 500 FCFA / 250g',
    format: 'Pot hermétique 250g, Sachet poudre 500g, Boules traditionnelles 500g',
    availability: 'disponible',
    mainImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
    ],
    isNew: true,
    isFeatured: true,
    origin: 'Savanes arborées & coopératives féminines',
    composition: '100% Graines de néré (Parkia biglobosa) fermentées naturellement',
    usageAdvice: '1 à 2 cuillères à café écrasées ou saupoudrées directement dans vos sauces chaudes pour remplacer les bouillons industriels.',
    createdAt: '2025-02-25T10:00:00Z'
  },
  {
    id: 'prod_1',
    name: 'Piment Rouge Extra Fort en Poudre',
    category: 'piments',
    description: 'Piment rouge mûr soigneusement trié, déshydraté et moulu fin. Arôme piquant, couleur rouge vif naturelle sans additif.',
    fullDescription: 'Notre piment rouge en poudre est issu de piments frais récoltés à pleine maturité. Ils passent par un lavage rigoureux, un séchage solaire thermorégulé qui préserve la capsaïcine et les arômes naturels, puis un broyage fin à froid. Idéal pour relever vos sauces, marinades, grillades et plats mijotés.',
    price: '1 500 FCFA / 100g',
    format: 'Flacon saupoudreur 100g, Sachet hermétique 250g & 1kg, Sac pro 25kg',
    availability: 'disponible',
    mainImage: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
    ],
    isNew: false,
    isFeatured: true,
    origin: 'Terroir agricole local certifié',
    composition: '100% Piments rouges séchés et broyés',
    usageAdvice: 'Ajouter en début de cuisson pour diffuser la chaleur, ou en fin de cuisson pour un piquant incisif.',
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'prod_2',
    name: 'Piments Forts Entiers Séchés au Soleil',
    category: 'piments',
    description: 'Piments entiers avec pédoncules préservés, séchés traditionnellement pour préserver toute la force et la fraîcheur gustative.',
    fullDescription: 'Sélection haut de gamme de gousses entières de piments habanero et bec d\'oiseau. Séchés au séchoir hygiénique, ils conservent leur huile essentielle et leur parfum fumé. Très prisés des chefs et des restaurateurs pour infuser les huiles pimentées ou piler au mortier.',
    price: '2 000 FCFA / 200g',
    format: 'Sachet kraft zippé 200g, 500g et carton vrac 10kg',
    availability: 'disponible',
    mainImage: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1526346698789-224822f00545?auto=format&fit=crop&w=800&q=80'
    ],
    isNew: true,
    isFeatured: true,
    origin: 'Cultures maraîchères paysannes',
    composition: '100% Piments entiers séchés',
    usageAdvice: 'À réhydrater 10 minutes dans l’eau tiède avant pilage ou à laisser infuser entier dans un bouillon.',
    createdAt: '2025-02-01T14:30:00Z'
  },
  {
    id: 'prod_3',
    name: 'Gingembre Pur en Poudre (Qualité Grand Arôme)',
    category: 'epices',
    description: 'Rhizomes de gingembre sélectionnés, pelés, séchés et broyés. Saveur piquante citronnée, fraîcheur garantie.',
    fullDescription: 'Notre poudre de gingembre pur se distingue par sa couleur jaune pâle dorée et son parfum énergisant immédiat. Sans résidus fibreux excessifs, elle se dissout parfaitement dans les boissons chaudes ou froides (jus de bissap, thé, gnamankoudji) ainsi que dans la cuisine salée et sucrée.',
    price: '1 800 FCFA / 150g',
    format: 'Pot étanche 150g, Sachet 500g, Sac kraft 5kg',
    availability: 'disponible',
    mainImage: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80'
    ],
    isNew: false,
    isFeatured: true,
    origin: 'Cultures en lisière forestière',
    composition: '100% Rhizome de gingembre lavé et moulu',
    usageAdvice: '1 cuillère à café pour 1L de boisson ou marinade pour viandes blanches et poissons.',
    createdAt: '2025-01-20T09:15:00Z'
  },
  {
    id: 'prod_4',
    name: 'Curcuma Pur en Poudre (Riche en Curcumine)',
    category: 'epices',
    description: 'Super-aliment couleur orange intense aux vertus antioxydantes remarquables, moulu à froid sans aucun additif.',
    fullDescription: 'Cultivé sur des sols riches et non traités, notre curcuma est nettoyé à l\'eau claire avant un séchage doux qui préserve son taux élevé de curcumine naturelle. Apporte une couleur dorée incomparable à vos riz, tajines, légumes sautés et laits dorés bien-être.',
    price: '1 700 FCFA / 150g',
    format: 'Pot 150g, Sachet hermétique 500g & 1kg',
    availability: 'disponible',
    mainImage: 'https://images.unsplash.com/photo-1615485290940-2794c483a998?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
    ],
    isNew: true,
    isFeatured: false,
    origin: 'Plantations partenaires certifiées bio-raisonnées',
    composition: '100% Curcuma longa pur',
    usageAdvice: 'Associer à une pincée de poivre noir et un filet d’huile pour décupler l’assimilation de la curcumine.',
    createdAt: '2025-02-10T11:00:00Z'
  },
  {
    id: 'prod_5',
    name: 'Mélange d’Épices Spécial Grillades & Sauces',
    category: 'produits_transformes',
    description: 'Une recette maison exclusive mariant piment doux, ail, oignon déshydraté, gingembre, poivre noir et herbes du terroir.',
    fullDescription: 'Ce mélange d\'épices complet prêt-à-l\'emploi a été développé pour faciliter la vie des cuisiniers et amateurs de barbecue. Il sublime les brochettes (chawarma, soya, suya), les poulets braisés, poissons grillés ainsi que les sauces traditionnelles au gombo ou à la graine.',
    price: '2 500 FCFA / 250g',
    format: 'Bocal verre 250g, Recharge éco 500g, Seau traiteur 5kg',
    availability: 'disponible',
    mainImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
    ],
    isNew: true,
    isFeatured: true,
    origin: 'Assemblage artisanal en atelier',
    composition: 'Piment doux, ail torréfié, gingembre, curcuma, poivre sauvage, sel marin iodé, herbes aromatiques',
    usageAdvice: 'Enrober vos viandes ou poissons avec un filet d’huile 30 minutes avant cuisson.',
    createdAt: '2025-02-18T16:00:00Z'
  },
  {
    id: 'prod_6',
    name: 'Purée Artisanale de Piment Fort en Bocal',
    category: 'produits_transformes',
    description: 'Purée onctueuse de piments frais concassés à l’huile végétale de première pression, légèrement salée et citronnée.',
    fullDescription: 'Pour ceux qui préfèrent le piquant frais et juteux au piment sec ! Fabriquée dans notre atelier chaque semaine à partir des arrivages directs de la ferme, cette purée est pasteurisée pour une conservation naturelle sans conservateurs de synthèse.',
    price: '2 200 FCFA / Bocal 200g',
    format: 'Bocal verre 200g & 450g',
    availability: 'disponible',
    mainImage: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isNew: false,
    isFeatured: false,
    origin: 'Atelier de transformation artisanal',
    composition: 'Piments habanero frais, huile végétale pure, jus de citron vert, sel',
    usageAdvice: 'Servir en condiment de table avec vos poissons braisés, atchéké ou frites d’igname.',
    createdAt: '2025-01-25T15:20:00Z'
  },
  {
    id: 'prod_7',
    name: 'Ail Déshydraté Concassé & Moulu',
    category: 'epices',
    description: 'Ail cultivé localement, débarrassé de son eau pour concentrer sa puissance aromatique sans amertume.',
    fullDescription: 'Pratique et toujours prêt à l’emploi, cet ail déshydraté préserve le goût rond et parfumé de l’ail frais sans les contraintes d’épluchage. Ne brûle pas à la friture.',
    price: '1 600 FCFA / 150g',
    format: 'Saupoudreur 150g, Sachet 500g',
    availability: 'disponible',
    mainImage: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isNew: false,
    isFeatured: false,
    origin: 'Cultures maraîchères de saison',
    composition: '100% Gousses d’ail séchées',
    usageAdvice: 'Saupoudrer directement sur viandes, vinaigrettes et sauces.',
    createdAt: '2025-01-10T12:00:00Z'
  },
  {
    id: 'prod_8',
    name: 'Poivre Noir en Grains du Terroir',
    category: 'epices',
    description: 'Grains de poivre noir récoltés à la main, séchés traditionnellement pour une saveur boisée et piquante intense.',
    fullDescription: 'Un poivre de caractère aux arômes floraux et boisés. Idéal à moudre au moulin au dernier moment pour libérer toute l’intensité de ses huiles volatiles.',
    price: '2 800 FCFA / 200g',
    format: 'Moulins rechargeables 100g, Sachet 200g & 1kg',
    availability: 'sur_commande',
    mainImage: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    isNew: false,
    isFeatured: false,
    origin: 'Plantations forestières humides',
    composition: '100% Poivre noir en grains entiers',
    usageAdvice: 'Moudre au moment de servir sur vos pièces de bœuf ou sauces crémeuses.',
    createdAt: '2025-02-05T08:00:00Z'
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Nouveau stock de piment rouge extra fort en poudre disponible !',
    category: 'Stock & Disponibilité',
    description: 'La nouvelle récolte de piments mûrs a été transformée avec succès. Les commandes de gros et demi-gros sont désormais ouvertes avec livraison rapide.',
    content: 'Nous sommes heureux d\'annoncer à nos clients particuliers, restaurateurs et grossistes l\'arrivée de notre nouvelle production de piment rouge en poudre. Séché à température contrôlée et moulu finement dans nos nouvelles installations, ce lot bénéficie d\'une couleur éclatante et d\'une force piquante remarquable. Conditionnements disponibles de 100g à 25kg.',
    image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=1200&q=80',
    status: 'publie',
    date: '2025-02-28',
    createdAt: '2025-02-28T09:00:00Z'
  },
  {
    id: 'ann_2',
    title: 'Présentation de notre unité de transformation et séchage moderne',
    category: 'Production & Qualité',
    description: 'Découvrez en vidéo les coulisses de notre atelier aux normes d\'hygiène strictes, garantissant pureté et traçabilité de la graine au sachet.',
    content: 'Dans le cadre de notre engagement pour la sécurité alimentaire, notre entreprise a inauguré de nouveaux séchoirs solaires hybrides et un broyeur cryogénique en acier inoxydable. Cela permet de préserver à 100% les vitamines et huiles essentielles de nos épices sans carbonisation ni perte d\'arôme.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-with-spices-and-vegetables-42777-large.mp4',
    status: 'publie',
    date: '2025-02-20',
    createdAt: '2025-02-20T11:30:00Z'
  },
  {
    id: 'ann_3',
    title: 'Participation à la Grande Foire Agricole & Agroalimentaire',
    category: 'Événements',
    description: 'Retrouvez notre stand de dégustation et découvrez nos nouveautés épicées du 15 au 18 du mois prochain.',
    content: 'Venez déguster nos mélanges d\'épices pour grillades, tester le piquant de nos piments séchés et échanger avec notre équipe technique sur les commandes en gros. Des remises spéciales foire seront appliquées sur tous les conditionnements familiaux.',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
    status: 'publie',
    date: '2025-02-14',
    createdAt: '2025-02-14T14:15:00Z'
  },
  {
    id: 'ann_4',
    title: 'Arrivage de curcuma frais moulu & conditionnements écologiques',
    category: 'Nouveautés',
    description: 'Adoptez nos nouveaux sachets kraft refermables 100% recyclables pour garder vos épices à l’abri de l’humidité.',
    content: 'Nous continuons notre transition écologique avec de nouveaux emballages haute barrière garantissant la fraîcheur aromatique tout en réduisant l\'empreinte plastique.',
    image: 'https://images.unsplash.com/photo-1615485290940-2794c483a998?auto=format&fit=crop&w=1200&q=80',
    status: 'publie',
    date: '2025-02-02',
    createdAt: '2025-02-02T10:00:00Z'
  }
];

export const initialMedia: MediaItem[] = [];

export const initialMessages: CustomerMessage[] = [
  {
    id: 'msg_1',
    name: 'Kouamé Jean-Marc (Restaurant Le Pimentier)',
    contact: '+225 05 44 33 22 11 / jm.kouame@restaurant-pimentier.ci',
    message: 'Bonjour, nous souhaiterions commander 50kg de piment rouge en poudre et 20kg de mélange grillades pour notre chaîne de restauration. Quels sont vos tarifs professionnels et délais de livraison ? Merci.',
    productReference: 'Piment Rouge Extra Fort en Poudre',
    status: 'nouveau',
    createdAt: '2025-03-01T09:14:00Z'
  },
  {
    id: 'msg_2',
    name: 'Awa Traoré',
    contact: 'awa.traore.commerce@gmail.com',
    message: 'Bonjour, faites-vous des livraisons en demi-gros pour les revendeuses sur le marché de gros ? Vos flacons de 100g de gingembre et curcuma m\'intéressent beaucoup.',
    productReference: 'Gingembre Pur en Poudre',
    status: 'nouveau',
    createdAt: '2025-03-02T14:30:00Z'
  },
  {
    id: 'msg_3',
    name: 'Moussa Diallo (Superette Épicerie)',
    contact: '+225 07 11 22 33 44',
    message: 'Message reçu concernant la disponibilité du piment séché entier. Nous passons commande de 15 sachets de 500g. Merci de nous confirmer quand c\'est prêt.',
    productReference: 'Piments Forts Entiers Séchés au Soleil',
    status: 'lu',
    createdAt: '2025-02-26T17:40:00Z'
  }
];
