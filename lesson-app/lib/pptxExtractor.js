const officeParser = require("officeparser");

/**
 * @param {string} filePath - chemin du fichier .pptx temporaire
 * @returns {Promise<string>} - texte brut extrait
 */
function extractPptxText(filePath) {
  return officeParser.parseOfficeAsync(filePath);
}

module.exports = { extractPptxText };
