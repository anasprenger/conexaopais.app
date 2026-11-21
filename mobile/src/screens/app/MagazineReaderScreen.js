import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeitorPdf from '../../components/LeitorPdf';
import { useApi } from '../../hooks/useApi';
import { buscarRevista } from '../../services/conteudoService';
import { colors, fonts, radius, spacing, type } from '../../theme';

// Modo de leitura, como o do site no celular: tela cheia, sem cabeçalho, no formato de story.
// Toque no lado direito avança, no esquerdo volta e no meio mostra ou esconde o progresso e o botão de sair.
// As edições de exemplo têm páginas de texto; as publicadas pelo site têm só o PDF, que abre aqui mesmo,
// uma página por vez (LeitorPdf), em vez de ir para o navegador.
const INVERTER_LADOS = false; // troque para true para inverter os lados, como no site

export default function MagazineReaderScreen({ navigation, route }) {
  // GET /api/revistas/:slug
  const { data: revista, error } = useApi(() => buscarRevista(route.params?.slug), [route.params?.slug]);
  const [pagina, setPagina] = useState(0);
  const [controles, setControles] = useState(true);
  const [totalPdf, setTotalPdf] = useState(null);
  const [erroPdf, setErroPdf] = useState('');
  const temporizador = useRef(null);

  // Mostra os controles ao abrir e esconde sozinho depois de alguns segundos
  const mostrarControlesPorUmTempo = useCallback(() => {
    setControles(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setControles(false), 3000);
  }, []);

  useEffect(() => {
    mostrarControlesPorUmTempo();
    return () => clearTimeout(temporizador.current);
  }, [mostrarControlesPorUmTempo]);

  if (!revista) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.center}>
          {error ? (
            <>
              <Text style={styles.message}>Não foi possível abrir a edição.</Text>
              <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button">
                <Text style={styles.backText}>Voltar</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator color={colors.card} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const modoPdf = revista.editavel || revista.conteudo.length === 0; // edição publicada pelo site: só o PDF
  const paginas = revista.conteudo;
  const total = modoPdf ? (totalPdf ?? 1) : paginas.length;
  const atual = paginas[pagina];
  const ultima = pagina === total - 1;
  const progresso = Math.round(((pagina + 1) / total) * 100);

  function tocarLado(lado) {
    const avancar = INVERTER_LADOS ? lado === 'esquerdo' : lado === 'direito';
    if (avancar) {
      if (ultima) mostrarControlesPorUmTempo();
      else setPagina(pagina + 1);
    } else if (pagina > 0) {
      setPagina(pagina - 1);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      {/* Barras de progresso, uma por página, como nos stories */}
      <View style={[styles.progress, !controles && styles.hidden]} pointerEvents="none">
        {total <= 24 ? (
          Array.from({ length: total }, (_, index) => (
            <View key={index} style={[styles.bar, index <= pagina && styles.barActive]} />
          ))
        ) : (
          // PDF com muitas páginas: uma barra só, que vai enchendo
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${progresso}%` }]} />
          </View>
        )}
      </View>
      {/* Escondidos, os controles não recebem toque (o X invisível não fecha a leitura sem querer) */}
      <View style={[styles.topBar, !controles && styles.hidden]} pointerEvents={controles ? 'auto' : 'none'}>
        <Text style={styles.topText} numberOfLines={1}>
          {revista.titulo} · {pagina + 1} de {total}{modoPdf ? ` · ${progresso}%` : ''}
        </Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Sair da leitura">
          <Ionicons name="close" size={28} color={colors.card} />
        </Pressable>
      </View>

      {modoPdf && (
        <View style={styles.pdf}>
          {erroPdf || !revista.pdf ? (
            <View style={styles.center}>
              <Text style={styles.message}>Não foi possível abrir o PDF aqui.</Text>
              {revista.pdf && (
                <Pressable onPress={() => Linking.openURL(revista.pdf)} style={styles.back} accessibilityRole="button">
                  <Text style={styles.backText}>Abrir no navegador</Text>
                </Pressable>
              )}
            </View>
          ) : (
            // Aqui os toques ficam com o próprio leitor (por cima de uma WebView, áreas de toque do app não
            // funcionam bem no iPhone): ele vira as páginas e avisa a página atual
            <LeitorPdf
              url={revista.pdf}
              aoMudarPagina={(numero, quantidade) => {
                setPagina(numero - 1);
                setTotalPdf(quantidade);
              }}
              aoTocarNoMeio={() => (controles ? setControles(false) : mostrarControlesPorUmTempo())}
              aoPassarDoFim={mostrarControlesPorUmTempo}
              aoFalhar={setErroPdf}
            />
          )}
        </View>
      )}

      {!modoPdf && (
        <View style={styles.page}>
          {/* As páginas da revista são curtas: cabem na tela, sem rolagem (a tela toda é área de toque) */}
          <View style={styles.pageContent}>
            <Text style={type.eyebrow}>
              Página {atual.numero} · {atual.secao}
            </Text>
            <Text style={[type.h1, styles.pageTitle]}>{atual.titulo}</Text>
            {atual.texto.map((paragrafo, index) => (
              <Text key={index} style={styles.paragraph}>
                {paragrafo}
              </Text>
            ))}
            {ultima && <Text style={styles.endText}>Fim da edição. Toque no X, no alto, para voltar à sinopse.</Text>}
          </View>

          {zonasDeToque()}
        </View>
      )}
    </SafeAreaView>
  );

  // Áreas de toque das páginas de texto: esquerda, meio e direita
  function zonasDeToque() {
    return (
      <View style={styles.zones} pointerEvents="box-none">
        <Pressable style={styles.zoneSide} onPress={() => tocarLado('esquerdo')} accessibilityLabel="Página anterior" />
        <Pressable
          style={styles.zoneMiddle}
          onPress={() => (controles ? setControles(false) : mostrarControlesPorUmTempo())}
          accessibilityLabel="Mostrar ou esconder os controles"
        />
        <Pressable style={styles.zoneSide} onPress={() => tocarLado('direito')} accessibilityLabel="Próxima página" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.card,
  },
  back: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  backText: {
    fontFamily: fonts.bold,
    color: colors.card,
  },
  hidden: {
    opacity: 0,
  },
  progress: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  barActive: {
    backgroundColor: colors.card,
  },
  barFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.card,
  },
  pdf: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.card,
  },
  page: {
    flex: 1,
    margin: spacing.md,
    marginTop: spacing.xs,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  pageContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  pageTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  paragraph: {
    marginBottom: spacing.md,
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 29,
    color: colors.text,
  },
  endText: {
    marginTop: spacing.lg,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  zones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  zoneSide: {
    flex: 3,
  },
  zoneMiddle: {
    flex: 4,
  },
});
