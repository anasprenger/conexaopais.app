import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';
import { definirUrlDaApi, normalizarUrlDaApi, obterUrlDaApi, testarConexao, urlPadraoDaApi } from '../../services/api';
import { salvarUrl } from '../../services/configuracao';
import { colors, fonts, radius, spacing, type } from '../../theme';

// Endereço da API usado pelo app. No APK, a API roda no notebook e o IP dele muda de uma rede Wi-Fi para outra:
// aqui dá para trocar o endereço sem gerar outro APK. O endereço só é salvo se a API responder.
export default function ApiConfigScreen() {
  const { refreshUser } = useAuth();
  const { reload } = useContent();
  const padrao = urlPadraoDaApi();
  const [emUso, setEmUso] = useState(obterUrlDaApi());
  const [endereco, setEndereco] = useState(obterUrlDaApi());
  const [aviso, setAviso] = useState(null);
  const [ocupado, setOcupado] = useState(null); // 'testar' | 'salvar'
  const url = normalizarUrlDaApi(endereco);

  async function conferir(acao) {
    if (!url) {
      setAviso({ tone: 'danger', title: 'Informe o endereço da API.' });
      return null;
    }
    setOcupado(acao);
    setAviso(null);
    try {
      const status = await testarConexao(url);
      if (status.banco !== 'ok') {
        setAviso({ tone: 'warning', title: 'A API respondeu, mas o banco de dados está desligado.', message: 'Ligue o MySQL no computador.' });
      }
      return status;
    } catch (falha) {
      setAviso({ tone: 'danger', title: falha.message, message: `Endereço testado: ${url}` });
      return null;
    } finally {
      setOcupado(null);
    }
  }

  async function testar() {
    const status = await conferir('testar');
    if (status?.banco === 'ok') setAviso({ tone: 'success', title: 'Conexão funcionando.', message: `API e banco respondendo em ${url}` });
  }

  async function aplicar(novaUrl) {
    definirUrlDaApi(novaUrl);
    await salvarUrl(novaUrl === padrao ? null : novaUrl);
    setEmUso(novaUrl);
    setEndereco(novaUrl);
    reload(); // busca os artigos de novo no endereço novo
    refreshUser().catch(() => {});
  }

  async function salvar() {
    const status = await conferir('salvar');
    if (!status) return;
    await aplicar(url);
    if (status.banco === 'ok') setAviso({ tone: 'success', title: 'Endereço salvo.', message: `O app agora usa ${url}` });
  }

  async function usarPadrao() {
    await aplicar(padrao);
    setAviso({ tone: 'info', title: 'Voltou para o endereço padrão.', message: padrao });
  }

  return (
    <Screen>
      <Text style={type.h1}>Conexão com a API</Text>
      <Text style={[type.muted, styles.intro]}>
        O app busca os dados na API do Conexão Pais. Quando a API roda no computador, o celular precisa estar no mesmo
        Wi-Fi e usar o IP do computador.
      </Text>

      <View style={styles.box}>
        <Text style={type.small}>Endereço em uso</Text>
        <Text style={styles.url} selectable>
          {emUso}
        </Text>
      </View>

      <TextField
        label="Endereço da API"
        icon="server-outline"
        placeholder="192.168.0.15"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        value={endereco}
        onChangeText={(valor) => {
          setEndereco(valor);
          setAviso(null);
        }}
      />
      {url && url !== endereco.trim() ? <Text style={[type.small, styles.preview]}>Será usado: {url}</Text> : null}

      {aviso && (
        <Notice tone={aviso.tone} title={aviso.title}>
          {aviso.message}
        </Notice>
      )}

      <View style={styles.actions}>
        <Button title="Testar" icon="pulse-outline" variant="outline" loading={ocupado === 'testar'} onPress={testar} style={styles.action} />
        <Button title="Salvar" icon="checkmark-outline" loading={ocupado === 'salvar'} onPress={salvar} style={styles.action} />
      </View>
      {emUso !== padrao && <Button title="Usar o endereço padrão" variant="ghost" small onPress={usarPadrao} />}

      <Notice tone="info" title="Onde encontro o endereço?" style={styles.dica}>
        Ao subir a API no computador (npm run dev), o terminal mostra o endereço para o celular, por exemplo
        http://192.168.0.15:3333/api. Basta digitar o IP: a porta 3333 e o /api são completados.
      </Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  box: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  url: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.primary,
  },
  preview: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  action: {
    flex: 1,
  },
  dica: {
    marginTop: spacing.lg,
  },
});
