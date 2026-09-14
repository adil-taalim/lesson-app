/**
 * Schéma JSON pivot — commun aux 3 matières (français / arabe / math)
 * et aux 6 niveaux du primaire.
 *
 * {
 *   matiere: "français" | "arabe" | "math",
 *   niveau: 1-6,
 *   titre: string,            // titre de la séance
 *   contexte: {               // ligne d'en-tête de la جذاذة
 *     programme: string,
 *     parcours: string,
 *     seance: string
 *   },
 *   objectifs: string[],
 *   materiel: string[],
 *   etapes: [
 *     {
 *       titre: string,        // ex: "Rituel"
 *       duree: string,        // ex: "10 min"
 *       contenu: string[]     // liste de points, en langage clair
 *     }
 *   ]
 * }
 *
 * Les générateurs (docxGenerator.js, svgGenerator.js) ne lisent QUE cette
 * forme. Toute variation par matière/niveau doit être absorbée en amont,
 * dans le prompt d'analyse (prompts.js) — jamais dans les générateurs.
 */

module.exports = {};
