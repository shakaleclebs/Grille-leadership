// ─────────────────────────────────────────────────────────────
// RÉFÉRENTIEL — seul fichier à modifier pour changer les textes.
// Les "id" servent d'adresse dans l'URL : lettres minuscules, chiffres
// et tirets uniquement, uniques au sein de leur niveau.
// Les comportements observables ne sont pas encore renseignés :
// chaque sous-compétence a une liste "behaviors" vide, à remplir
// avec les formulations définitives (une chaîne par comportement).
// ─────────────────────────────────────────────────────────────

export type Category = "tache" | "motivation";

export type SubCompetence = {
  id: string;
  title: string;
  behaviors: string[];
};

export type Competence = {
  id: string;
  title: string;
  category: Category;
  subCompetencies: SubCompetence[];
};

export const referentielTitle = "Référentiel des compétences";

export const categoryLabels: Record<Category, string> = {
  tache: "Tâche",
  motivation: "Motivation",
};

export const competences: Competence[] = [
  // ── TÂCHE (colonne gauche, dans cet ordre) ──
  {
    id: "tache-1",
    title: "Améliore performance équipe",
    category: "tache",
    subCompetencies: [
      { id: "tache-1-sous-1", title: "Performant au poste", behaviors: [] },
      { id: "tache-1-sous-2", title: "Combatif", behaviors: [] },
      { id: "tache-1-sous-3", title: "Intégré au jeu collectif", behaviors: [] },
    ],
  },
  {
    id: "tache-2",
    title: "Prise de décision",
    category: "tache",
    subCompetencies: [
      { id: "tache-2-sous-1", title: "Organisant jeu", behaviors: [] },
      { id: "tache-2-sous-2", title: "Analysant jeu", behaviors: [] },
      { id: "tache-2-sous-3", title: "Régulant jeu", behaviors: [] },
    ],
  },
  {
    id: "tache-3",
    title: "Investissement",
    category: "tache",
    subCompetencies: [
      { id: "tache-3-sous-1", title: "Incarner exemplarité", behaviors: [] },
      { id: "tache-3-sous-2", title: "Engagé", behaviors: [] },
      { id: "tache-3-sous-3", title: "Intensité", behaviors: [] },
    ],
  },

  // ── MOTIVATION (colonne droite, dans cet ordre) ──
  {
    id: "motivation-1",
    title: "Gestion émotionnelle",
    category: "motivation",
    subCompetencies: [
      { id: "motivation-1-sous-1", title: "Serein", behaviors: [] },
      { id: "motivation-1-sous-2", title: "Lucide", behaviors: [] },
      { id: "motivation-1-sous-3", title: "Gérer ses émotions", behaviors: [] },
    ],
  },
  {
    id: "motivation-2",
    title: "Cohésion",
    category: "motivation",
    subCompetencies: [
      { id: "motivation-2-sous-1", title: "Rassembler coéquipiers", behaviors: [] },
      { id: "motivation-2-sous-2", title: "Accentuer solidarité", behaviors: [] },
      { id: "motivation-2-sous-3", title: "Capter attention coéquipiers", behaviors: [] },
    ],
  },
  {
    id: "motivation-3",
    title: "Soutien affectif/motivationnel",
    category: "motivation",
    subCompetencies: [
      { id: "motivation-3-sous-1", title: "Encourager", behaviors: [] },
      { id: "motivation-3-sous-2", title: "Rassurer", behaviors: [] },
      { id: "motivation-3-sous-3", title: "Communication engagée", behaviors: [] },
    ],
  },

  // Exemple de comportements observables à saisir (à copier) :
  // behaviors: [
  //   "Premier comportement observable",
  //   "Deuxième comportement observable",
  // ],
];

export function getCompetence(id: string) {
  return competences.find((c) => c.id === id);
}
