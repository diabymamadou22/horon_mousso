import { DeliveryZone } from '../types';

export const deliveryZones: DeliveryZone[] = [
  {
    id: 'zone_bamako_rg',
    name: 'Bamako • Rive Gauche (ACI 2000, Hamdallaye, Quinzambougou, Darsalam)',
    fee: 1000,
    delay: 'Sous 2h à 4h'
  },
  {
    id: 'zone_bamako_rd',
    name: 'Bamako • Rive Droite (Badalabougou, Baco-Djicoroni, Faladié, Torokorobougou)',
    fee: 1500,
    delay: 'Sous 2h à 4h'
  },
  {
    id: 'zone_bamako_peri',
    name: 'Périphérie • Grand Bamako (Kati, Koulikoro, Sanankoroba, Baguinéda)',
    fee: 2500,
    delay: 'Sous 24h ouvrées'
  },
  {
    id: 'zone_regions',
    name: 'Régions de l’Intérieur (Ségou, Sikasso, Mopti, Kayes, Koutiala)',
    fee: 3500,
    delay: 'Sous 24h à 48h (Dépôt Gare / Compagnie)'
  },
  {
    id: 'zone_retrait',
    name: 'Retrait en boutique / Atelier Horon Mousso (Gratuit)',
    fee: 0,
    delay: 'Prêt en 30 minutes'
  }
];
