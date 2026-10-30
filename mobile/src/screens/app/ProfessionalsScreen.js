import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import PageHero from '../../components/PageHero';
import ProfessionalCard from '../../components/ProfessionalCard';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import { profissionais } from '../../data/profissionais';
import { colors, radius, spacing, type } from '../../theme';
import { normalize } from '../../utils/text';

const areas = ['Todas', ...new Set(profissionais.map((p) => p.especialidade))];

export default function ProfessionalsScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [area, setArea] = useState('Todas');

  const termo = normalize(busca);
  const resultados = profissionais.filter((p) => {
    const combinaArea = area === 'Todas' || p.especialidade === area;
    const combinaBusca = !termo || [p.nome, p.especialidade, p.descricao].some((campo) => normalize(campo).includes(termo));
    return combinaArea && combinaBusca;
  });

  return (
    <Screen>
      <PageHero
        eyebrow="Diretório"
        title="Encontre um profissional"
        description="Perfis de profissionais parceiros, com área de atuação e formas de contato."
      />

      <TextField icon="search" placeholder="Buscar por nome ou especialidade..." value={busca} onChangeText={setBusca} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={styles.chipsContent}>
        {areas.map((item) => (
          <Chip key={item} label={item} selected={area === item} onPress={() => setArea(item)} />
        ))}
      </ScrollView>

      {resultados.length === 0 ? (
        <EmptyState title="Nenhum profissional encontrado para esta busca." />
      ) : (
        resultados.map((profissional) => (
          <ProfessionalCard
            key={profissional.slug}
            profissional={profissional}
            onPress={() => navigation.navigate('Professional', { slug: profissional.slug })}
          />
        ))
      )}

      <View style={styles.join}>
        <Text style={type.h3}>É profissional?</Text>
        <Text style={[type.muted, styles.joinText]}>
          Crie uma conta do tipo Profissional. A administração confere o seu registro antes de liberar a publicação de
          artigos.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    marginHorizontal: -spacing.md,
    marginBottom: spacing.sm,
  },
  chipsContent: {
    paddingHorizontal: spacing.md,
  },
  join: {
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.accentSoft,
  },
  joinText: {
    marginTop: spacing.sm,
  },
});
