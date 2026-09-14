const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, WidthType, ShadingType, AlignmentType, VerticalAlign
} = require("docx");

const NAVY = "1F3864";
const LIGHT = "D9E2F3";
const WHITE = "FFFFFF";

function bodyCell(text, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: LIGHT } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, bold: !!opts.bold })] })]
  });
}

function headCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: NAVY },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: WHITE, size: 20 })] })]
  });
}

function sectionTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 26 })]
  });
}

function bullet(text) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 20 })] });
}

/**
 * @param {object} data - objet respectant lib/schema.js
 * @returns {Promise<Buffer>}
 */
async function generateJaddah(data) {
  const infoRows = [
    ["Matière", data.matiere],
    ["Niveau", `${data.niveau}e année du primaire`],
    ["Programme", data.contexte && data.contexte.programme || ""],
    ["Parcours", data.contexte && data.contexte.parcours || ""],
    ["Séance", data.contexte && data.contexte.seance || ""]
  ].filter(([, v]) => v);

  const infoTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    columnWidths: [3000, 6500],
    rows: infoRows.map(([k, v]) => new TableRow({ children: [bodyCell(k, 3000, { bold: true, shade: true }), bodyCell(v, 6500)] }))
  });

  const derTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    columnWidths: [2200, 1000, 6300],
    rows: [
      new TableRow({ children: [headCell("Étape", 2200), headCell("Durée", 1000), headCell("Contenu", 6300)] }),
      ...data.etapes.map((e, i) => new TableRow({
        children: [
          bodyCell(e.titre, 2200, { bold: true, shade: i % 2 === 0 }),
          bodyCell(e.duree || "", 1000, { shade: i % 2 === 0 }),
          new TableCell({
            width: { size: 6300, type: WidthType.DXA },
            shading: i % 2 === 0 ? { type: ShadingType.CLEAR, fill: LIGHT } : undefined,
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: (e.contenu || []).map(c => new Paragraph({
              bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: c, size: 19 })]
            }))
          })
        ]
      }))
    ]
  });

  const doc = new Document({
    sections: [{
      properties: { page: { size: { width: 11907, height: 16840 } } },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 200 },
          children: [new TextRun({ text: `جذاذة - ${data.titre || "Fiche de préparation"}`, bold: true, size: 34, color: NAVY })]
        }),
        infoTable,
        sectionTitle("Objectifs"),
        ...(data.objectifs || []).map(bullet),
        sectionTitle("Matériel"),
        ...(data.materiel || []).map(bullet),
        sectionTitle("Déroulement de la séance"),
        derTable
      ]
    }]
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateJaddah };
