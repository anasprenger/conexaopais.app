import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import AsyncState from '../../components/AsyncState';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useApi } from '../../hooks/useApi';
import { atualizarRevista, buscarRevista } from '../../services/conteudoService';
import { spacing, type } from '../../theme';

// Somente administração: "Editar edição", como o botão da sinopse no site. Troca título e sinopse de uma
// edição publicada pelo site, sem mudar o endereço dela. O PDF continua sendo trocado pelo site.
export default function MagazineEditScreen({ navigation, route }) {
  const slug = route.params?.slug;
  // GET /api/revistas/:slug
  const { data: revista, loading, error, reload } = useApi(() => buscarRevista(slug), [slug]);
  const [titulo, setTitulo] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (revista) {
      setTitulo(revista.titulo);
      setSinopse(revista.descricao ?? '');
    }
  }, [revista]);

  // PUT /api/revistas/:slug
  async function salvar() {
    if (titulo.trim().length < 3) {
      setErros({ titulo: 'O título deve ter pelo menos 3 caracteres.' });
      return;
    }
    setSalvando(true);
    setErros({});
    setAviso(null);
    try {
      await atualizarRevista(slug, { titulo: titulo.trim(), sinopse: sinopse.trim() });
      navigation.goBack();
    } catch (falha) {
      setErros(falha.campos ?? {});
      setAviso(falha.message);
      setSalvando(false);
    }
  }

  return (
    <Screen>
      <AsyncState loading={loading && !revista} error={error} onRetry={reload}>
        <Text style={[type.muted, styles.intro]}>
          As mudanças aparecem no app e no site. Para trocar o PDF da edição, use o site.
        </Text>
        {aviso && <Notice tone="danger" title={aviso} />}
        <TextField label="Título" value={titulo} onChangeText={setTitulo} error={erros.titulo} maxLength={160} />
        <TextField
          label="Sinopse"
          value={sinopse}
          onChangeText={setSinopse}
          error={erros.sinopse}
          multiline
          maxLength={4000}
        />
        <Text style={[type.small, styles.hint]}>
          Dica: linhas que começam com "-" aparecem como tópicos em "Nesta edição".
        </Text>
        <Button title="Salvar alterações" icon="checkmark" loading={salvando} onPress={salvar} style={styles.save} />
      </AsyncState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.md,
  },
  hint: {
    marginTop: -spacing.xs,
  },
  save: {
    marginTop: spacing.lg,
  },
});
