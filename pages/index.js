import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError("Choisissez un fichier .pptx"); return; }
    setLoading(true); setError(""); setResult(null);

    const formData = new FormData();
    formData.append("pptx", file);
    if (matiere) formData.append("matiere", matiere);
    if (niveau) formData.append("niveau", niveau);

    try {
      const resp = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Erreur inconnue");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>جذاذة + خطاطة — générateur automatique</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="file" accept=".pptx" onChange={e => setFile(e.target.files[0])} />
        <select value={matiere} onChange={e => setMatiere(e.target.value)}>
          <option value="">Matière : détection automatique</option>
          <option value="français">Français</option>
          <option value="arabe">Arabe</option>
          <option value="math">Mathématiques</option>
        </select>
        <select value={niveau} onChange={e => setNiveau(e.target.value)}>
          <option value="">Niveau : détection automatique</option>
          {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}e année</option>)}
        </select>
        <button type="submit" disabled={loading}>{loading ? "Génération en cours..." : "Générer"}</button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 32 }}>
          <h2>جذاذة</h2>
          <a
            download="jaddah.docx"
            href={`data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${result.jaddahBase64}`}
          >
            Télécharger la fiche (.docx)
          </a>

          <h2 style={{ marginTop: 24 }}>خطاطة ذهنية</h2>
          <div dangerouslySetInnerHTML={{ __html: result.khoutataSvg }} />
        </div>
      )}
    </div>
  );
}
