const PALETTE = ["c-teal", "c-coral", "c-amber", "c-blue", "c-green", "c-pink"];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Génère une خطاطة ذهنية en SVG (nœud central + une étape par branche verticale).
 * Conçu pour être affiché directement dans une <img>/inline, ou converti en
 * PNG côté client si besoin (ex: via canvas + resvg, hors scope de ce squelette).
 *
 * @param {object} data - objet respectant lib/schema.js
 * @returns {string} - code SVG complet
 */
function generateKhoutata(data) {
  const boxW = 300, boxX = 40, centerX = boxX + boxW / 2;
  const boxH = 56, gap = 30;
  const centralY = 20, centralH = 56;

  let y = centralY + centralH + gap;
  const steps = [];
  for (const etape of data.etapes || []) {
    steps.push({ y, titre: etape.titre, sub: `${(etape.contenu || [])[0] || ""}${etape.duree ? " · " + etape.duree : ""}` });
    y += boxH + gap;
  }
  const totalHeight = y - gap + 40;

  const centralTitle = esc(data.titre || "Séance");
  const centralSub = esc(`${data.matiere || ""}${data.niveau ? " · " + data.niveau + "e année" : ""}`);

  let body = `<g class="c-purple">
  <rect x="${boxX - 10}" y="${centralY}" width="${boxW + 20}" height="${centralH}" rx="10" stroke-width="0.5"/>
  <text class="th" x="${centerX}" y="${centralY + 18}" text-anchor="middle" dominant-baseline="central">${centralTitle}</text>
  <text class="ts" x="${centerX}" y="${centralY + 38}" text-anchor="middle" dominant-baseline="central">${centralSub}</text>
</g>
`;

  steps.forEach((s, i) => {
    const prevBottom = i === 0 ? centralY + centralH : steps[i - 1].y + boxH;
    const cls = PALETTE[i % PALETTE.length];
    body += `<line x1="${centerX}" y1="${prevBottom}" x2="${centerX}" y2="${s.y}" class="arr" marker-end="url(#arrow)"/>
<g class="${cls}">
  <rect x="${boxX}" y="${s.y}" width="${boxW}" height="${boxH}" rx="10" stroke-width="0.5"/>
  <text class="th" x="${centerX}" y="${s.y + 18}" text-anchor="middle" dominant-baseline="central">${esc(i + 1 + ". " + s.titre)}</text>
  <text class="ts" x="${centerX}" y="${s.y + 38}" text-anchor="middle" dominant-baseline="central">${esc(s.sub)}</text>
</g>
`;
  });

  const style = `
.th{font:500 14px sans-serif;}
.ts{font:400 12px sans-serif;}
.arr{stroke:#888;stroke-width:1.5;}
.c-purple rect{fill:#EEEDFE;stroke:#534AB7;} .c-purple text{fill:#26215C;}
.c-teal rect{fill:#E1F5EE;stroke:#0F6E56;} .c-teal text{fill:#04342C;}
.c-coral rect{fill:#FAECE7;stroke:#993C1D;} .c-coral text{fill:#4A1B0C;}
.c-amber rect{fill:#FAEEDA;stroke:#854F0B;} .c-amber text{fill:#412402;}
.c-blue rect{fill:#E6F1FB;stroke:#185FA5;} .c-blue text{fill:#042C53;}
.c-green rect{fill:#EAF3DE;stroke:#3B6D11;} .c-green text{fill:#173404;}
.c-pink rect{fill:#FBEAF0;stroke:#993556;} .c-pink text{fill:#4B1528;}
`;

  return `<svg width="100%" viewBox="0 0 380 ${totalHeight}" xmlns="http://www.w3.org/2000/svg" role="img">
<title>خطاطة ذهنية</title>
<desc>${centralTitle}</desc>
<defs>
<style>${style}</style>
<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>
</defs>
${body}</svg>`;
}

module.exports = { generateKhoutata };
