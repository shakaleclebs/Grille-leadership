// Connexion à la base Supabase « Referentiel Rugby ».
//
// La clé ci-dessous est la clé « publishable » du projet : elle est conçue
// pour être publique. Ce qui protège les données, ce sont les règles de la
// base (Row Level Security) et les contraintes SQL, pas le secret de cette clé.
// Le code administrateur, lui, n'est pas ici : il est stocké dans la base.
//
// Ces valeurs peuvent être remplacées par des variables d'environnement
// (NEXT_PUBLIC_SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY) si tu en ajoutes un
// jour un fichier .env.local.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ntkrrugduboexvomdxvi.supabase.co";

export const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_Rf8DWjl618FH3H8b3ID5pA_BSkqBCT2";
