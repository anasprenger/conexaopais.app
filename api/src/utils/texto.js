// Funções de texto usadas pelos models

function slugify(valor) {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 150);
}

// "Emoções, Diálogo" -> ['Emoções', 'Diálogo']
function listaDeTags(valor) {
  return (valor || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

// Mesmo cálculo do site: 200 palavras por minuto, mínimo de 1 minuto
function minutosDeLeitura(...textos) {
  const palavras = textos.join(' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}

module.exports = { slugify, listaDeTags, minutosDeLeitura };
