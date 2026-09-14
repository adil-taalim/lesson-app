# جذاذة + خطاطة — générateur automatique

App Next.js qui prend un PPTX de leçon (français / arabe / math, niveaux 1 à 6)
et génère automatiquement :
- une **جذاذة** (fiche de préparation) en `.docx`
- une **خطاطة ذهنية** (mind map) en SVG

## Architecture

```
pages/index.js          -> formulaire d'upload (fichier + matière/niveau optionnels)
pages/api/generate.js   -> route API : extraction -> prompt IA -> JSON pivot -> fichiers
lib/pptxExtractor.js    -> extraction du texte du PPT (officeparser, pur Node)
lib/prompts.js          -> prompt commun + blocs spécifiques par matière
lib/schema.js           -> documentation du JSON pivot partagé
lib/docxGenerator.js    -> génère la جذاذة à partir du JSON pivot
lib/svgGenerator.js     -> génère la خطاطة à partir du JSON pivot
```

Le JSON pivot (voir `lib/schema.js`) est LE point central : les deux
générateurs ne connaissent jamais la matière ni le niveau directement,
seulement `titre / objectifs / materiel / etapes[]`. Tout ce qui varie par
matière ou niveau est géré dans `lib/prompts.js`.

## Déploiement sur Vercel

1. Créer un repo Git avec ce dossier, le pousser sur GitHub.
2. Sur vercel.com : "New Project" → importer le repo.
3. Ajouter la variable d'environnement `GEMINI_API_KEY` (Project Settings →
   Environment Variables) avec une clé API Gemini valide (gratuite — voir
   https://aistudio.google.com/apikey).
4. Déployer.

## En local

```bash
npm install
export GEMINI_API_KEY=AIza...
npm run dev
```

Puis ouvrir http://localhost:3000

## Limites connues de ce squelette (à améliorer ensuite)

- Pas de conversion SVG → PNG côté serveur (le SVG est affiché/téléchargeable tel quel).
- Pas de gestion RTL spécifique dans le docx pour l'arabe (à ajouter dans
  `docxGenerator.js` si `data.matiere === "arabe"`).
- Pas de détection automatique de matière par mots-clés avant l'appel IA
  (actuellement, la détection est déléguée entièrement au prompt).
- Pas de limite de taille de fichier / validation de format côté serveur.
- Pas de persistance (chaque génération est à la volée, rien n'est sauvegardé).
