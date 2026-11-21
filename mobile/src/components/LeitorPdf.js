import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme';

// Leitor do PDF da revista dentro do app, como o modo de leitura do site: uma página por vez, ocupando a tela.
// O PDF é desenhado pelo pdf.js (a mesma biblioteca do site) numa WebView. O app baixa o arquivo e entrega os
// bytes para a WebView, assim não depende das regras de acesso (CORS) do servidor onde o PDF está guardado.
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

const html = `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: ${colors.primary}; touch-action: none; user-select: none; -webkit-user-select: none; }
  body { display: flex; align-items: center; justify-content: center; }
  canvas { display: none; border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25); }
  p { font: 15px sans-serif; color: rgba(255, 255, 255, 0.85); }
</style>
</head>
<body>
<canvas id="folha"></canvas>
<p id="aviso">Carregando a edição…</p>
<script src="${PDFJS}/pdf.min.js"></script>
<script src="${PDFJS}/pdf.worker.min.js"></script>
<script>
  const enviar = (dados) => window.ReactNativeWebView.postMessage(JSON.stringify(dados));
  let documento = null;
  let atual = 1;
  let tarefa = null;
  let desenhando = false;
  let pendente = null;

  function bytesDoBase64(base64) {
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
    return bytes;
  }

  // Desenha sempre a última página pedida: se a pessoa vira várias páginas rápido, as do meio são puladas.
  // A página inteira cabe na tela (sem rolar), na resolução do aparelho para o texto ficar nítido.
  async function desenhar(numero) {
    pendente = numero;
    if (desenhando) {
      if (tarefa) tarefa.cancel();
      return;
    }
    desenhando = true;
    while (pendente !== null) {
      const alvo = pendente;
      pendente = null;
      try {
        const pagina = await documento.getPage(alvo);
        if (pendente !== null) continue;
        const base = pagina.getViewport({ scale: 1 });
        const margem = 8;
        const escala = Math.min((innerWidth - margem * 2) / base.width, (innerHeight - margem * 2) / base.height);
        const densidade = Math.min(devicePixelRatio || 1, 3);
        const viewport = pagina.getViewport({ scale: escala * densidade });
        const canvas = document.getElementById('folha');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = viewport.width / densidade + 'px';
        canvas.style.height = viewport.height / densidade + 'px';
        tarefa = pagina.render({ canvasContext: canvas.getContext('2d'), viewport });
        await tarefa.promise;
        canvas.style.display = 'block';
        document.getElementById('aviso').style.display = 'none';
      } catch (erro) {
        if (!erro || erro.name !== 'RenderingCancelledException') {
          enviar({ tipo: 'erro', mensagem: String((erro && erro.message) || erro) });
        }
      } finally {
        tarefa = null;
      }
    }
    desenhando = false;
  }

  // A própria WebView vira as páginas e avisa o app (que mostra o progresso e o "x de y")
  function irPara(numero) {
    if (!documento) return;
    const alvo = Math.min(documento.numPages, Math.max(1, numero));
    if (alvo === atual) {
      if (numero > atual) enviar({ tipo: 'fim' });
      return;
    }
    atual = alvo;
    desenhar(alvo);
    enviar({ tipo: 'pagina', numero: alvo, total: documento.numPages });
  }

  // Toque: lado direito avança, esquerdo volta, meio mostra ou esconde os controles.
  // Arrastar para a esquerda avança e para a direita volta.
  let inicio = null;
  addEventListener('pointerdown', (e) => {
    inicio = { x: e.clientX, y: e.clientY };
  });
  addEventListener('pointerup', (e) => {
    if (!inicio) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    inicio = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      irPara(atual + (dx < 0 ? 1 : -1));
    } else if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
      const posicao = e.clientX / innerWidth;
      if (posicao < 0.3) irPara(atual - 1);
      else if (posicao > 0.7) irPara(atual + 1);
      else enviar({ tipo: 'controles' });
    }
  });
  addEventListener('pointercancel', () => {
    inicio = null;
  });

  window.abrir = async (base64) => {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDFJS}/pdf.worker.min.js';
      documento = await pdfjsLib.getDocument({ data: bytesDoBase64(base64) }).promise;
      atual = 1;
      enviar({ tipo: 'pagina', numero: 1, total: documento.numPages });
      desenhar(1);
    } catch (erro) {
      enviar({ tipo: 'erro', mensagem: String((erro && erro.message) || erro) });
    }
  };

  enviar(window.pdfjsLib ? { tipo: 'pronto' } : { tipo: 'erro', mensagem: 'Sem internet para abrir o leitor.' });
</script>
</body>
</html>`;

// Baixa o PDF no app e devolve o conteúdo em base64 (o formato que dá para passar para a WebView)
async function baixarEmBase64(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`O PDF não foi encontrado (${resposta.status}).`);
  const arquivo = await resposta.blob();
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result).split(',')[1] ?? '');
    leitor.onerror = () => reject(new Error('Não foi possível ler o PDF.'));
    leitor.readAsDataURL(arquivo);
  });
}

// Os toques e o arrastar são tratados dentro da WebView, que vira as páginas sozinha e avisa o app:
// aoMudarPagina(numero, total) a cada página (começa em 1), aoTocarNoMeio() para mostrar ou esconder os controles,
// aoPassarDoFim() ao tentar avançar na última página e aoFalhar(mensagem) se algo der errado.
export default function LeitorPdf({ url, aoMudarPagina, aoTocarNoMeio, aoPassarDoFim, aoFalhar }) {
  const webview = useRef(null);
  const [pronto, setPronto] = useState(false);

  // Quando o pdf.js estiver pronto na WebView, baixa o PDF e entrega para ele
  useEffect(() => {
    if (!pronto || !url) return undefined;
    let ativo = true;
    baixarEmBase64(url)
      .then((base64) => ativo && webview.current?.injectJavaScript(`window.abrir(${JSON.stringify(base64)}); true;`))
      .catch((erro) => ativo && aoFalhar?.(erro.message));
    return () => {
      ativo = false;
    };
  }, [pronto, url]); // eslint-disable-line react-hooks/exhaustive-deps

  function aoReceber(evento) {
    let mensagem;
    try {
      mensagem = JSON.parse(evento.nativeEvent.data);
    } catch {
      return;
    }
    if (mensagem.tipo === 'pronto') setPronto(true);
    if (mensagem.tipo === 'pagina') aoMudarPagina?.(mensagem.numero, mensagem.total);
    if (mensagem.tipo === 'controles') aoTocarNoMeio?.();
    if (mensagem.tipo === 'fim') aoPassarDoFim?.();
    if (mensagem.tipo === 'erro') aoFalhar?.(mensagem.mensagem);
  }

  return (
    <WebView
      ref={webview}
      source={{ html }}
      originWhitelist={['*']}
      onMessage={aoReceber}
      onError={() => aoFalhar?.('Não foi possível abrir o leitor.')}
      scrollEnabled={false}
      bounces={false}
      style={styles.webview}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
