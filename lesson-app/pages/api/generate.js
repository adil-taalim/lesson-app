const formidable = require("formidable");
const fs = require("fs");
const { extractPptxText } = require("../../lib/pptxExtractor");
const { buildPrompt } = require("../../lib/prompts");
const { generateJaddah } = require("../../lib/docxGenerator");
const { generateKhoutata } = require("../../lib/svgGenerator");

export const config = { api: { bodyParser: false } };

function parseForm(req) {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err); else resolve({ fields, files });
    });
  });
}

async function callGemini(prompt) {
  const model = "gemini-flash-latest"; // alias Google, pointe toujours vers le Flash le plus récent
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4 }
    })
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${t}`);
  }
  const data = await resp.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("\n").trim();
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  try {
    const { fields, files } = await parseForm(req);
    const file = files.pptx && (Array.isArray(files.pptx) ? files.pptx[0] : files.pptx);
    if (!file) {
      res.status(400).json({ error: "Aucun fichier PPTX reçu (champ 'pptx')" });
      return;
    }

    const matiereHint = fields.matiere && (Array.isArray(fields.matiere) ? fields.matiere[0] : fields.matiere);
    const niveauHint = fields.niveau && (Array.isArray(fields.niveau) ? fields.niveau[0] : fields.niveau);

    const pptText = await extractPptxText(file.filepath || file.path);
    const prompt = buildPrompt(pptText, matiereHint, niveauHint ? Number(niveauHint) : undefined);
    const pivotData = await callGemini(prompt);

    const docxBuffer = await generateJaddah(pivotData);
    const svgString = generateKhoutata(pivotData);

    res.status(200).json({
      pivotData,
      jaddahBase64: docxBuffer.toString("base64"),
      khoutataSvg: svgString
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}
