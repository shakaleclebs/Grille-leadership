import { competences, type Category, type Competence } from "@/data/competences";

// Couleurs de l'interface. 3 teintes par famille, de la plus claire à la plus foncée.
// Chaque paire bg/fg est vérifiée pour un contraste de lecture élevé (≥ 7:1).
type Shade = { bg: string; fg: string };

const palettes: Record<Category, Shade[]> = {
  tache: [
    { bg: "#cfe6dd", fg: "#0f332c" }, // Tâche 1 — claire
    { bg: "#7fb5a3", fg: "#0b2621" }, // Tâche 2 — intermédiaire
    { bg: "#1e5b4f", fg: "#ffffff" }, // Tâche 3 — foncée
  ],
  motivation: [
    { bg: "#d8dcf3", fg: "#1a2058" }, // Motivation 1 — claire
    { bg: "#909ad9", fg: "#111640" }, // Motivation 2 — intermédiaire
    { bg: "#34408c", fg: "#ffffff" }, // Motivation 3 — foncée
  ],
};

// Couleur de texte sombre de chaque famille (en-têtes, blocs de comportements).
export const familyInk: Record<Category, string> = {
  tache: "#0f332c",
  motivation: "#1a2058",
};

// Teinte d'une compétence selon sa position dans sa colonne (ordre du fichier de données).
export function getShade(c: Competence): Shade {
  const rank = competences.filter((x) => x.category === c.category).indexOf(c);
  const shades = palettes[c.category];
  return shades[Math.max(rank, 0) % shades.length];
}
