// Remove acentos e deixa em minúsculas, para buscas mais tolerantes ("educacao" encontra "Educação")
export function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function getInitials(name) {
  return name
    .replace(/^(Dra?\.)\s+/, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// Mesmo cálculo do site: 200 palavras por minuto, mínimo de 1 minuto
export function tempoLeitura(textos) {
  const palavras = textos.join(' ').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(palavras / 200))} min`;
}

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Data no formato usado no site: "12 ago 2026"
export function dataCurta(date = new Date()) {
  return `${String(date.getDate()).padStart(2, '0')} ${meses[date.getMonth()]} ${date.getFullYear()}`;
}

export function slugify(text) {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Separa o texto em parágrafos (linha em branco entre eles), como no formulário do site
export function paragrafos(texto) {
  return texto
    .split(/\n\s*\n/)
    .map((parte) => parte.trim())
    .filter(Boolean);
}

// "1 curtida", "2 curtidas"
export function plural(total, singular, pluralForm) {
  return `${total} ${total === 1 ? singular : pluralForm}`;
}
