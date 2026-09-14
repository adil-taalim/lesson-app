const COMMON_INSTRUCTIONS = `
Tu es un conseiller pédagogique marocain expert du cycle primaire.
On te donne le texte brut extrait d'un PowerPoint de leçon (slide par slide).
Ta tâche : produire UNIQUEMENT un objet JSON valide (rien avant, rien après,
pas de balises markdown) respectant EXACTEMENT ce schéma :

{
  "matiere": "français" | "arabe" | "math",
  "niveau": <nombre 1-6>,
  "titre": "<titre court de la séance>",
  "contexte": { "programme": "<...>", "parcours": "<...>", "seance": "<...>" },
  "objectifs": ["<objectif 1>", "..."],
  "materiel": ["<matériel 1>", "..."],
  "etapes": [
    { "titre": "<nom de l'étape>", "duree": "<ex: 10 min>", "contenu": ["<point 1>", "..."] }
  ]
}

Règles générales :
- Déduis la matière et le niveau du contenu si non fournis explicitement.
- "etapes" doit suivre l'ordre réel de la séance (généralement 3 à 5 étapes).
- Chaque élément de "contenu" est une action ou un point pédagogique concret,
  écrit simplement (pas de citation mot à mot de tout le PPT, reformule/synthétise).
- N'invente rien qui ne soit pas déductible du texte fourni.
`;

const SUBJECT_BLOCKS = {
  francais: `
Spécificités français (à intégrer dans "etapes"/"objectifs") :
- Isole clairement : rituel, vocabulaire (mots cibles), lecture-écriture
  (sons/syllabes/mots-outils), clôture/jeux.
- Si des mots de vocabulaire ou des sons/lettres sont ciblés, liste-les
  explicitement dans le "contenu" de l'étape correspondante.
`,
  arabe: `
Spécificités arabe (à intégrer dans "etapes"/"objectifs") :
- Isole clairement : تمهيد/رتوال، مفردات، حروف/مقاطع، قراءة-كتابة، ختام.
- Les valeurs de "contenu" peuvent être écrites en arabe si le PPT est en arabe ;
  garde les clés JSON ("titre", "duree", "contenu"...) en français/anglais tel quel.
- Signale si la leçon nécessite un rendu RTL (texte majoritairement en arabe).
`,
  math: `
Spécificités mathématiques (à intégrer dans "etapes"/"objectifs") :
- Il n'y a pas de "vocabulaire" au sens lexical : structure plutôt en
  découverte de la notion, manipulation/exemples, exercices d'application,
  correction/synthèse.
- Liste dans "contenu" les exemples numériques ou opérations concrètes vus.
`
};

function detectSubjectKey(matiereHint) {
  if (!matiereHint) return null;
  const m = matiereHint.toLowerCase();
  if (m.startsWith("fr")) return "francais";
  if (m.startsWith("ar")) return "arabe";
  if (m.startsWith("math")) return "math";
  return null;
}

/**
 * Construit le prompt final.
 * @param {string} pptText - texte extrait du PPT (markitdown/officeparser)
 * @param {string} [matiereHint] - "français" | "arabe" | "math" | undefined (auto)
 * @param {number} [niveauHint] - 1-6 | undefined (auto)
 */
function buildPrompt(pptText, matiereHint, niveauHint) {
  const key = detectSubjectKey(matiereHint);
  const subjectBlock = key
    ? SUBJECT_BLOCKS[key]
    : `Détecte toi-même la matière parmi français / arabe / math à partir du
contenu, puis applique les bonnes pratiques de structuration propres à
cette matière (vocabulaire pour le français, حروف/مقاطع pour l'arabe,
notion/exercices pour les maths).`;

  const niveauLine = niveauHint
    ? `Niveau confirmé : ${niveauHint}e année du primaire.`
    : `Niveau non précisé : déduis-le du contenu (complexité du vocabulaire,
présence de notions plus avancées, etc.) et indique-le dans "niveau".`;

  return `${COMMON_INSTRUCTIONS}
${subjectBlock}
${niveauLine}

Voici le contenu extrait du PowerPoint :
"""
${pptText}
"""`;
}

module.exports = { buildPrompt };
