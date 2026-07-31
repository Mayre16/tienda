// AUTOGENERADO por scripts/sync-sedes.mjs — NO editar a mano.
// Fuente: sedes publicadas del sitio principal (CMS acropolis / published.json).
// Regenerar con: npm run sedes:sync

export type SyncedSede = {
  id: string;
  name: string;
  zone: string;
  city: string;
  address: string;
  reference?: string;
  mapsQuery: string;
};

export const PRINCIPAL_SEDES: SyncedSede[] = [
  {
    id: "sede-naco",
    name: "Naco",
    zone: "Ens. Naco",
    city: "Santo Domingo",
    address: "C. Cub Scouts 6, Santo Domingo, República Dominicana",
    reference: "Edificio Multiuso\nAntes de Av. Tiradentes, detrás de Plaza Merengue",
    mapsQuery: "https://maps.app.goo.gl/zMUycj9AVE5Qg4bm9",
  },
  {
    id: "sede-los-prados",
    name: "Los Prados",
    zone: "Los Prados",
    city: "Santo Domingo",
    address: "Eugenio Deschamps No. 61",
    reference: "Plaza Mlc",
    mapsQuery: "https://maps.app.goo.gl/7L3N2p78cTi3Yjg36",
  },
  {
    id: "sede-santiago",
    name: "Santiago",
    zone: "Jardines del Este",
    city: "Santiago",
    address: "C. Penetración 10, Santiago de los Caballeros 51000, República Dominicana",
    reference: "Conzientte Centro de Bienestar ",
    mapsQuery: "https://share.google/HemoheV7GChR2NU5G",
  },
];
