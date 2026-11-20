// Funções de texto usadas pelos models

// Sem acentos e em minúsculas: usado nos slugs e nas buscas
function normalizar(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// Mesmo formato do site: "Avós e netos!" -> "avos-e-netos"
function slugify(valor) {
  return normalizar(valor)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Mesmo cálculo do site: 200 palavras por minuto, mínimo de 1 minuto
function minutosDeLeitura(...textos) {
  const palavras = textos.join(' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Datas escritas nos conteúdos de exemplo do site -> "AAAA-MM-DD"
// "12 ago 2026" -> "2026-08-12" | "Agosto de 2026" -> "2026-08-01"
function dataDoTexto(texto) {
  const partes = normalizar(texto).replace(/\bde\b/g, ' ').split(/\s+/).filter(Boolean);
  const dia = partes.length === 3 ? Number(partes[0]) : 1;
  const mes = MESES.indexOf(partes[partes.length - 2]?.slice(0, 3)) + 1;
  const ano = Number(partes[partes.length - 1]);
  if (!mes || !ano || !dia) return null;
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// Mesmo critério do site (separarResumo): linhas que começam com "-" ou "•" viram tópicos; o resto é texto corrido.
// "- A - B" na mesma linha vira dois tópicos.
function separarSinopse(sinopse) {
  const texto = [];
  const topicos = [];
  for (const bruta of String(sinopse ?? '').split(/\n/)) {
    const linha = bruta.trim();
    if (!linha) continue;
    const topico = linha.match(/^[-•–]\s*(.+)$/);
    if (topico) {
      topicos.push(
        ...topico[1]
          .split(/\s+[-–]\s+/)
          .map((item) => item.trim())
          .filter(Boolean)
      );
    } else {
      texto.push(linha);
    }
  }
  return { texto, topicos };
}

module.exports = { normalizar, slugify, minutosDeLeitura, dataDoTexto, separarSinopse };
