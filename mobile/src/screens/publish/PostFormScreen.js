import { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncState from '../../components/AsyncState';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { canEditArticle, useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';
import { useApi } from '../../hooks/useApi';
import { buscarArtigo } from '../../services/artigosService';
import { colors, fonts, spacing } from '../../theme';

const formularioVazio = { titulo: '', categoria: null, resumo: '', texto: '', tags: '' };

// Área de publicação: criar (POST /api/artigos) ou editar (PUT /api/artigos/:id) um artigo.
// Só existe na navegação para admin e profissional aprovado; o autor edita os próprios artigos e o admin, todos.
export default function PostFormScreen({ navigation, route }) {
  const { user } = useAuth();
  const { categorias, saveArtigo } = useContent();
  const idEdicao = route.params?.id;

  // Na edição, busca o artigo completo (com o texto) na API
  const { data: editando, loading, error, reload } = useApi(
    () => (idEdicao ? buscarArtigo(idEdicao) : Promise.resolve(null)),
    [idEdicao]
  );
  const [form, setForm] = useState(formularioVazio);
  const [errors, setErrors] = useState({});
  const [erroApi, setErroApi] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) {
      setForm({
        titulo: editando.titulo,
        categoria: editando.categoria,
        resumo: editando.resumo,
        texto: editando.texto,
        tags: editando.tags.join(', '),
      });
    }
  }, [editando]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: idEdicao ? 'Editar artigo' : 'Nova postagem' });
  }, [navigation, idEdicao]);

  if (idEdicao && !editando) {
    return (
      <Screen>
        <AsyncState loading={loading} error={error} onRetry={reload} />
      </Screen>
    );
  }

  if (editando && !canEditArticle(user, editando)) {
    return (
      <Screen>
        <Notice tone="danger" title="Você não pode editar este artigo.">
          Apenas o autor e a administração podem alterar uma publicação.
        </Notice>
      </Screen>
    );
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function publicar() {
    const newErrors = {};
    if (form.titulo.trim().length < 5) newErrors.titulo = 'Escreva um título (mínimo de 5 caracteres).';
    if (!form.categoria) newErrors.categoria = 'Escolha uma categoria.';
    if (form.resumo.trim().length < 20) newErrors.resumo = 'Escreva um resumo (mínimo de 20 caracteres).';
    if (form.texto.trim().length < 50) newErrors.texto = 'O texto precisa ter pelo menos 50 caracteres.';
    setErrors(newErrors);
    setErroApi('');
    if (Object.keys(newErrors).length > 0) return;

    setSalvando(true);
    try {
      // POST ou PUT com o token: a API confere se a pessoa pode publicar ou editar este artigo
      const id = await saveArtigo({
        ...(editando && { id: editando.id }),
        titulo: form.titulo.trim(),
        categoria: form.categoria,
        resumo: form.resumo.trim(),
        conteudo: form.texto.trim(),
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      // Edição volta para a tela anterior (o artigo aberto busca de novo); publicação nova abre o artigo
      if (editando) navigation.goBack();
      else navigation.replace('Article', { id });
    } catch (falha) {
      const { conteudo, ...campos } = falha.campos;
      setErrors({ ...campos, ...(conteudo && { texto: conteudo }) });
      setErroApi(falha.message);
      setSalvando(false);
    }
  }

  return (
    <Screen>
      <Notice tone="info">
        Nesta versão o app publica artigos. Posts, colunas e edições da revista continuam sendo publicados pelo site.
      </Notice>

      <TextField label="Título" placeholder="Ex.: Uma rotina que acolhe" value={form.titulo} onChangeText={(v) => update('titulo', v)} error={errors.titulo} />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.chips}>
        {categorias.map((categoria) => (
          <Chip key={categoria} label={categoria} selected={form.categoria === categoria} onPress={() => update('categoria', categoria)} />
        ))}
      </View>
      {errors.categoria && <Text style={styles.error}>{errors.categoria}</Text>}

      <TextField
        label="Resumo"
        placeholder="Uma ou duas frases que apresentam o texto"
        multiline
        value={form.resumo}
        onChangeText={(v) => update('resumo', v)}
        error={errors.resumo}
        style={styles.afterChips}
      />
      <TextField
        label="Texto"
        placeholder="Escreva separando os parágrafos com uma linha em branco."
        multiline
        value={form.texto}
        onChangeText={(v) => update('texto', v)}
        error={errors.texto}
      />
      <TextField label="Tags (opcional)" placeholder="Ex.: Rotina, Organização" value={form.tags} onChangeText={(v) => update('tags', v)} error={errors.tags} />

      {erroApi ? <Notice tone="danger" title={erroApi} /> : null}

      <Button
        title={editando ? 'Salvar alterações' : 'Publicar'}
        icon="paper-plane-outline"
        variant="accent"
        loading={salvando}
        onPress={publicar}
      />
      <Button title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} style={styles.cancel} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.danger,
  },
  afterChips: {
    marginTop: spacing.sm,
  },
  cancel: {
    marginTop: spacing.sm,
  },
});
