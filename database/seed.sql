-- =============================================================================
-- Conexão Pais — dados iniciais (executar depois do schema.sql)
-- Conteúdo de exemplo trazido do site conexaopais.com.br.
-- Contas de demonstração: senha 123456 para todas (armazenada apenas como hash bcrypt).
-- =============================================================================

USE conexao_pais;

-- Usuários (1 admin, 1 família, profissionais aprovados e 2 cadastros aguardando análise)
INSERT INTO usuarios (id, nome, email, senha_hash, nivel, profissao, registro_profissional, verificacao) VALUES
  (1, 'Ana Sprenger', 'admin@conexaopais.test', '$2b$10$9UtISFHb9lJBeJ3HUhjQ2u21hCjKT14O/kdw1TCqeh0jDo24omGo.', 'admin', NULL, NULL, 'aprovado'),
  (2, 'Dra. Helena Prado', 'profissional@conexaopais.test', '$2b$10$LWKj.5008jHDkm7wWULonu/AFq5wJlNS.FO/JIZ0vYkgMqhdaDF4C', 'profissional', 'Psicóloga', 'CRP 07/123456', 'aprovado'),
  (3, 'Marina Souza', 'familia@conexaopais.test', '$2b$10$8Fc3k/QMyV2epW0L9MrjEeBusADm.ZRac/i8r5j1e3Stnm65CKiI6', 'usuario', NULL, NULL, 'aprovado'),
  (4, 'Carla Mendes', 'carla.mendes@exemplo.com', '$2b$10$bdqmfC0JrW6LuWfM7qCJ.e9iMyKInTdG7Bz2imAjIYbJgwRIqx2EO', 'profissional', 'Fonoaudióloga', 'CRFa 2-12345', 'pendente'),
  (5, 'Paulo Ribeiro', 'paulo.ribeiro@exemplo.com', '$2b$10$15Qu1LeJKx4hrAxpKzbIxe28FezF30VkMzEZT3pwCmF8WFWctiLd6', 'profissional', 'Nutricionista', 'CRN-3 45678', 'pendente'),
  (6, 'Marcos Vilela', 'marcos@conexaopais.test', '$2b$10$w6Sw5aLPHpbNkN1EVGKnxeGoQseBy0YOFVCEeASU4ncPcEuYhwmg2', 'profissional', 'Terapeuta familiar', 'CRP 04/654321', 'aprovado'),
  (7, 'Bianca Toledo', 'bianca@conexaopais.test', '$2b$10$lnJXvVVch6ziBndp5skElOvI12sWbGXnN8ZqQskHYBqhC767.W446', 'profissional', 'Pedagoga', NULL, 'aprovado'),
  (8, 'Dr. Rafael Nunes', 'rafael@conexaopais.test', '$2b$10$QvxaiY4HyZ4XucBU0ML7J.sm1aycKsWWrnWr2rcMFKNv6ebpeSyhC', 'profissional', 'Pediatra', 'CRM/PR 000123', 'aprovado');

-- Diretório de profissionais
INSERT INTO profissionais (id, usuario_id, slug, nome, especialidade, descricao, cidade, atendimento, whatsapp) VALUES
  (1, 2, 'helena-prado', 'Dra. Helena Prado', 'Psicologia infantil', 'Atende famílias há 15 anos, com foco em vínculo e regulação emocional.', 'Porto Alegre, RS', 'Presencial e online', '5551999990001'),
  (2, 8, 'rafael-nunes', 'Dr. Rafael Nunes', 'Pediatria', 'Sono, alimentação e desenvolvimento na primeira infância.', 'Curitiba, PR', 'Presencial', '5551999990002'),
  (3, 7, 'bianca-toledo', 'Bianca Toledo', 'Pedagogia', 'Alfabetização, adaptação escolar e parceria entre escola e família.', 'São Paulo, SP', 'Online', '5551999990003'),
  (4, 6, 'marcos-vilela', 'Marcos Vilela', 'Terapia familiar', 'Mediação de conflitos e cuidado com idosos na dinâmica familiar.', 'Belo Horizonte, MG', 'Presencial e online', '5551999990004');

-- Publicações (artigos)
INSERT INTO publicacoes (id, autor_id, tipo, slug, titulo, resumo, conteudo, categoria, tags, destaque, status, criado_em) VALUES
  (1, 2, 'artigo', 'conversas-dificeis', 'Conversas difíceis: como falar sobre sentimentos com crianças', 'Nomear emoções é o primeiro passo para que a criança aprenda a lidar com elas. Um guia prático para o dia a dia.', 'Quando uma criança grita, chora ou se fecha, ela não está tentando complicar o dia de quem cuida. Ela está comunicando algo que ainda não sabe traduzir em palavras. A tarefa do adulto, nesses momentos, é menos corrigir e mais emprestar linguagem: dizer o nome daquilo que está acontecendo dentro dela.

Nomear emoções parece simples, mas é um trabalho de repetição. "Você ficou frustrado porque queria continuar brincando" ensina mais do que "não é para chorar por isso". A primeira frase organiza a experiência; a segunda apenas informa que aquele sentimento não é bem-vindo. Com o tempo, a criança que ouve a primeira frase começa a usá-la sozinha.

Escolha o momento com cuidado. No pico da crise, o corpo está em alerta e quase nada do que é dito entra. Fique perto, ofereça presença física, reduza estímulos e espere. A conversa vem depois, quando a respiração acalma. Ali, sim, vale revisitar o que aconteceu e pensar juntos em outra saída para a próxima vez.

Evite perguntas que fecham o assunto. "Por que você fez isso?" costuma gerar defesa ou silêncio. Troque por observações: "Vi que você ficou muito irritado quando o seu irmão pegou o carrinho." Descrever sem julgar abre espaço para que a criança complete a história do jeito dela.

Fale também dos seus sentimentos, em doses adequadas à idade. Uma criança que escuta "hoje eu estou cansada, preciso de dez minutos quietos" aprende que emoções não são vergonhosas e que existem formas de cuidar delas. Você se torna, sem discurso, o modelo que ela vai imitar.

Não espere resolução imediata. Muitas conversas importantes acontecem em capítulos: no carro, na hora de dormir, dias depois. O que fica não é a frase perfeita, mas a certeza de que aquele assunto pode ser trazido de novo sem punição.

Se a intensidade das crises interferir no sono, na escola ou nas relações da criança por semanas seguidas, procure ajuda profissional. Pedir apoio não é sinal de fracasso da família: é ampliar a rede de quem cuida.', 'Desenvolvimento', 'Emoções, Diálogo, Primeira infância', 1, 'publicado', '2026-08-12 09:00:00'),
  (2, 6, 'artigo', 'avos-e-netos', 'Avós e netos: o valor de manter as gerações por perto', 'O que a convivência intergeracional ensina — para os dois lados.', 'Existe um tipo de tempo que só os avós têm. Não é o tempo produtivo da rotina, com horários e listas, mas um tempo mais lento, em que se pode contar a mesma história duas vezes e ninguém reclama. Para a criança, esse ritmo é um descanso; para o avô ou a avó, é uma forma de continuar sendo útil e presente.

A convivência entre gerações transmite algo que nenhum aplicativo entrega: pertencimento. Saber de onde veio o nome que se carrega, ouvir como era a casa antiga, entender que os adultos também foram crianças — tudo isso constrói uma noção de história pessoal que sustenta a identidade mais tarde.

Do outro lado, o ganho é igualmente concreto. Idosos que convivem com netos relatam menos solidão e mais sensação de propósito. O cuidado, quando não vira obrigação diária e exaustiva, funciona como vínculo, não como peso.

É aí que entra o combinado entre os adultos. Avós não são creche nem substitutos dos pais. Definir dias, limites e o que é negociável evita o desgaste silencioso que costuma aparecer meses depois, quando alguém se sente usado ou passado por cima.

Diferenças de método vão existir. Doce fora de hora, dormir mais tarde, um pouco mais de tela. Vale escolher as batalhas: o que é questão de saúde e segurança não se negocia; o resto pode ser licença poética da casa dos avós.

Quando a distância física é grande, a chamada de vídeo curta e frequente vale mais do que a longa e rara. Cinco minutos duas vezes por semana criam hábito. E hábito, entre gerações, é o que transforma parentesco em relação.', 'Gerações', 'Avós, Memória, Convivência', 0, 'publicado', '2026-08-08 09:00:00'),
  (3, 7, 'artigo', 'rotina-que-acolhe', 'Uma rotina que acolhe (e não aprisiona)', 'Previsibilidade dá segurança. Rigidez, não. Onde fica o equilíbrio.', 'Rotina não é planilha. É a sensação de saber o que vem depois. Crianças que reconhecem a sequência do dia gastam menos energia tentando adivinhar o mundo e sobra mais para brincar, aprender e se acalmar sozinhas.

Comece pelos três momentos que mais tensionam a casa: acordar, comer e dormir. Se esses ancorarem, o resto se organiza em volta. Não é preciso controlar cada hora do dia para colher o benefício.

O sinal de que a rotina virou prisão é o clima: se o cumprimento do horário produz mais briga do que calma, algo precisa afrouxar. Combinados servem à família, e não o contrário.

Envolva a criança na construção. Ela pode escolher a ordem de duas tarefas, o livro da noite, a música da arrumação. Escolher pequenas coisas reduz a disputa pelas grandes.

Reveja o combinado a cada mudança relevante — nova escola, irmão que nasce, mudança de casa. Rotina que não se atualiza vira discurso repetido que ninguém segue.', 'Educação', 'Rotina, Organização', 0, 'publicado', '2026-08-02 09:00:00'),
  (4, 8, 'artigo', 'telas-sem-culpa', 'Telas sem culpa: combinados possíveis para a família real', 'Menos proibição, mais acordo. Como construir limites que se sustentam.', 'A pergunta "quanto tempo de tela é permitido?" costuma esconder outra, mais útil: o que essa tela está substituindo hoje? Meia hora de vídeo depois de uma tarde de parque tem outro peso do que três horas seguidas no lugar de qualquer outra coisa.

Combinados sustentáveis são específicos e visíveis. "Depois do jantar não tem tela" funciona melhor do que "use menos o celular". Deixe o acordo escrito em algum lugar da casa: reduz a discussão diária, porque a regra deixa de ser humor do adulto.

Avise antes do fim. Interromper de repente gera reação em qualquer idade. Um aviso de cinco minutos e um combinado sobre o que vem depois evitam a maior parte dos conflitos.

Preste atenção ao conteúdo, não só ao relógio. Assistir junto, comentar, escolher o que entra em casa: isso ensina critério, algo que a criança levará para quando você não estiver por perto.

Adultos também entram no acordo. Difícil pedir que a criança desligue durante a refeição enquanto o celular do adulto fica na mesa. O combinado que vale para todos é o único que dura.

Se a tela virou a única forma de acalmar, de comer ou de dormir, vale conversar com um profissional. Não é sobre culpa; é sobre recuperar repertório.', 'Convivência', 'Telas, Limites, Acordos', 0, 'publicado', '2026-07-28 09:00:00');

-- Comunidade: interações e comentários das contas de demonstração
INSERT INTO interacoes (usuario_id, publicacao_id, tipo) VALUES
  (3, 1, 'curtida'),
  (3, 1, 'salvo'),
  (3, 4, 'curtida'),
  (1, 1, 'curtida'),
  (2, 2, 'curtida'),
  (1, 3, 'salvo');

INSERT INTO comentarios (publicacao_id, usuario_id, texto, criado_em) VALUES
  (1, 3, 'A parte de descrever sem julgar mudou as conversas aqui em casa. Obrigada pelo texto!', '2026-08-14 20:15:00'),
  (1, 2, 'Que bom saber, Marina! Com o tempo, a própria criança começa a usar essas palavras.', '2026-08-15 08:40:00');

-- Colunas e suas publicações
INSERT INTO colunas (id, colunista_id, slug, nome, chamada, periodicidade, sobre) VALUES
  (1, 6, 'entre-geracoes', 'Entre Gerações', 'Histórias e reflexões sobre o que passa de avós para netos.', 'Quinzenal', 'Uma coluna sobre heranças invisíveis: gestos, receitas, silêncios e frases que atravessam três gerações dentro da mesma casa.'),
  (2, 7, 'diario-de-quem-cuida', 'Diário de quem cuida', 'Relatos honestos sobre a rotina de cuidar sem se perder.', 'Semanal', 'Anotações de quem vive a rotina por dentro: cansaço, culpa, pequenas vitórias e o direito de não dar conta de tudo.'),
  (3, 2, 'consultorio-aberto', 'Consultório aberto', 'Perguntas reais de famílias, respondidas com calma.', 'Mensal', 'Cada edição responde perguntas enviadas por responsáveis, sem jargão e sem receita pronta.');

INSERT INTO coluna_posts (coluna_id, slug, titulo, resumo, texto, publicado_em) VALUES
  (1, 'a-cadeira-da-varanda', 'A cadeira da varanda', 'Sobre os lugares da casa que guardam memória de quem já não senta mais nela.', 'Toda casa tem um móvel que ninguém usa e ninguém joga fora. Na casa da minha avó era uma cadeira de vime na varanda, com o assento cedendo no meio. Foi ali que ela contou, durante anos, as mesmas quatro histórias para netos diferentes.

Quando as famílias me procuram para falar de perda, quase sempre aparece um objeto assim. Ele funciona como um lugar de encontro entre o que foi vivido e o que ainda dói. Guardar não é ficar preso; é ter onde chegar quando a saudade aperta.

Meu conselho prático é simples: dê nome ao objeto e conte a história dele em voz alta, para quem for pequeno. Memória que não é narrada se dissolve em uma geração.', '2026-08-14'),
  (1, 'quando-o-avo-precisa-de-cuidado', 'Quando o avô passa a precisar de cuidado', 'A inversão de papéis que ninguém ensina e a conversa que é melhor não adiar.', 'Há um dia em que o carro precisa ficar na garagem, ou em que os remédios passam a ser conferidos por outra pessoa. Esse dia costuma chegar antes da conversa sobre ele, e é aí que a família se desorganiza.

Antecipar é gentileza. Perguntar, com calma e enquanto ainda há autonomia, como aquela pessoa gostaria de ser cuidada evita decisões tomadas na urgência e no ressentimento.

Distribuir tarefas entre os adultos, por escrito, protege quem naturalmente assume tudo — quase sempre uma mulher da família. Cuidado que não é dividido vira adoecimento silencioso.', '2026-07-31'),
  (2, 'a-culpa-de-nao-dar-conta', 'A culpa de não dar conta', 'Sobre o padrão impossível que a gente aceitou sem perceber.', 'Nenhuma geração antes da nossa cuidou de crianças com tão pouca rede e tanta plateia. A comparação é constante e o parâmetro é sempre o melhor dia da vida de outra família.

A pergunta que ajuda não é "estou fazendo o suficiente?", mas "o que dá para sustentar nesta semana?". Cuidado sustentável é o único que continua existindo no mês que vem.

Escolher três prioridades por semana e abandonar o resto, sem drama, é uma prática que recomendo a todas as famílias com quem trabalho.', '2026-08-18'),
  (2, 'domingo-a-tarde', 'Domingo à tarde', 'O horário mais difícil da semana e o que fazer com ele.', 'Existe uma tristeza específica do fim do domingo. Nas casas com crianças, ela costuma virar birra, dor de barriga ou discussão sobre mochila.

Ritualizar essa hora ajuda: uma refeição simples e repetida, uma conversa curta sobre o que vem na semana, algo previsível que sinalize a virada.

Não é preciso resolver a tristeza. Basta não deixá-la sozinha.', '2026-08-11'),
  (3, 'meu-filho-nao-quer-ir-a-escola', '"Meu filho não quer ir à escola"', 'Como diferenciar resistência passageira de sinal de alerta.', 'A recusa escolar quase nunca é sobre a escola em si. É sobre algo que acontece lá e que ainda não foi dito: um colega, uma dificuldade de aprendizagem, um professor que assusta, uma separação difícil em casa.

Antes de negociar a ida, investigue com perguntas concretas: com quem brincou, o que foi fácil, o que foi chato, quem senta ao lado. Perguntas amplas recebem respostas vazias.

Se a recusa durar mais de duas semanas ou vier com sintomas físicos, converse com a escola e com um profissional. Quanto mais cedo, menor o estrago no vínculo com o aprender.', '2026-08-05');

-- Revista digital
INSERT INTO revistas (id, slug, edicao, titulo, subtitulo, descricao, categoria, destaques, pdf_url, publicada_em) VALUES
  (1, 'edicao-03', 3, 'O tempo que passamos juntos', 'Rotina, presença e o que fica das horas em família', 'Uma edição sobre a qualidade do tempo compartilhado: rotinas possíveis, rituais simples e o valor das pequenas conversas.', 'Convivência', 'Reportagem: a rotina real de cinco famílias
Entrevista com a Dra. Helena Prado
Ensaio fotográfico: avós e netos', 'https://conexaopais.com.br/revistas/edicao-03.pdf', '2026-08-01'),
  (2, 'edicao-02', 2, 'Escola e casa, mesma direção', 'Como construir parceria com quem educa junto', 'Adaptação escolar, reuniões que funcionam e combinados entre família e escola.', 'Educação', 'Guia da adaptação
O que perguntar na reunião', 'https://conexaopais.com.br/revistas/edicao-02.pdf', '2026-06-01'),
  (3, 'edicao-01', 1, 'Começar por aqui', 'A primeira edição do Conexão Pais', 'Nossa carta de intenções: por que existimos e o que queremos construir com as famílias.', 'Institucional', 'Manifesto
Quem faz o Conexão Pais', 'https://conexaopais.com.br/revistas/edicao-01.pdf', '2026-04-01');

INSERT INTO revista_paginas (revista_id, numero, secao, titulo, texto) VALUES
  (1, 1, 'Capa', 'O tempo que passamos juntos', 'Edição 03 · Agosto de 2026

Rotina, presença e o que fica das horas em família.'),
  (1, 2, 'Carta da edição', 'Presença não se mede em horas', 'Passamos meses ouvindo famílias falar de tempo: o que falta, o que sobra e o que se perde na pressa.

Esta edição não traz fórmulas de produtividade doméstica. Traz relatos de casas reais e de pequenas escolhas que mudaram o clima do dia.'),
  (1, 3, 'Reportagem', 'A rotina real de cinco famílias', 'Cinco casas abriram a agenda de uma semana inteira para a nossa equipe.

O que se repete não é o horário, e sim a existência de um momento fixo em que todos estão no mesmo lugar — mesmo que por vinte minutos.

Quem tem esse momento relata menos conflito na hora de dormir.'),
  (1, 4, 'Entrevista', 'Dra. Helena Prado', '"A criança não precisa de um adulto disponível o tempo todo. Precisa de um adulto previsível."

A psicóloga fala sobre vínculo, culpa e o que realmente sustenta a segurança emocional na infância.'),
  (2, 1, 'Capa', 'Escola e casa, mesma direção', 'Edição 02 · Junho de 2026

Parceria com quem educa junto.'),
  (2, 2, 'Guia', 'A adaptação escolar, dia por dia', 'Os primeiros quinze dias definem o tom do ano.

Despedidas curtas, previsíveis e sem barganha reduzem a ansiedade de quem fica e de quem vai.'),
  (2, 3, 'Prático', 'O que perguntar na reunião', 'Cinco perguntas que rendem mais do que "como ele está indo?".

Comece por: com quem ele brinca no recreio?'),
  (3, 1, 'Capa', 'Começar por aqui', 'Edição 01 · Abril de 2026

Ajudando a unir famílias e gerações.'),
  (3, 2, 'Manifesto', 'Por que existimos', 'Informação sobre criar filhos existe de sobra. O que falta é lugar tranquilo para encontrá-la.

Nosso compromisso é com conteúdo revisado por profissionais e escrito em linguagem de gente.'),
  (3, 3, 'Equipe', 'Quem faz o Conexão Pais', 'Uma redação pequena e um conselho técnico que revisa cada publicação.');
