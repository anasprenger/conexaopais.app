// Arquivos guardados no Supabase Storage (ex.: PDFs das edições da revista enviados pela administração no site).
// O banco guarda só o caminho do arquivo; para abrir, é preciso um link assinado, que vale por um tempo.

async function linkAssinado(bucket, caminho, segundos = 60 * 60) {
  const url = (process.env.SUPABASE_URL ?? '').replace(/\/+$/, '');
  const chave = process.env.SUPABASE_PUBLISHABLE_KEY ?? '';
  if (!url || !chave || !caminho) return null;

  // Chaves novas do Supabase (sb_publishable_...) vão só no cabeçalho apikey; as antigas também como Bearer
  const headers = { apikey: chave, 'Content-Type': 'application/json' };
  if (!chave.startsWith('sb_')) headers.Authorization = `Bearer ${chave}`;

  const arquivo = caminho.split('/').map(encodeURIComponent).join('/');
  try {
    const resposta = await fetch(`${url}/storage/v1/object/sign/${bucket}/${arquivo}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ expiresIn: segundos }),
    });
    if (!resposta.ok) return null;
    const { signedURL } = await resposta.json();
    return signedURL ? `${url}/storage/v1${signedURL}` : null;
  } catch {
    return null;
  }
}

// Converte o valor salvo em pdf_url num link que o celular consegue abrir (mesma regra do site):
// link completo fica igual; caminho começando com "/" é um arquivo do site; o resto está no Storage.
async function linkDoPdf(valor) {
  if (!valor) return null;
  if (valor.startsWith('http')) return valor;
  if (valor.startsWith('/')) return `${(process.env.SITE_URL || 'https://conexaopais.com').replace(/\/+$/, '')}${valor}`;
  return linkAssinado('revistas', valor);
}

module.exports = { linkAssinado, linkDoPdf };
