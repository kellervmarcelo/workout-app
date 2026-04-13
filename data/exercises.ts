import type { ExerciseLibraryItem } from '~/types'

export const exerciseLibrary: ExerciseLibraryItem[] = [
  // PEITO (6)
  {
    id: 'supino-reto-barra',
    name: 'Supino Reto com Barra',
    description:
      'Deite no banco reto, segure a barra com pegada média. Desça até tocar o peito e empurre de volta.',
    muscleGroup: 'peito',
    imageUrl: '/exercises/supino-reto-barra.svg',
  },
  {
    id: 'supino-inclinado-halteres',
    name: 'Supino Inclinado com Halteres',
    description:
      'Banco inclinado a 30-45°. Desça os halteres até a altura do peito e empurre para cima.',
    muscleGroup: 'peito',
    imageUrl: '/exercises/supino-inclinado-halteres.svg',
  },
  {
    id: 'supino-declinado',
    name: 'Supino Declinado',
    description:
      'Banco declinado. Desça a barra até a parte inferior do peito e empurre para cima.',
    muscleGroup: 'peito',
    imageUrl: '/exercises/supino-declinado.svg',
  },
  {
    id: 'crossover-cabo',
    name: 'Crossover na Polia',
    description:
      'Em pé entre as polias altas, puxe as alças para frente e para baixo, unindo as mãos à frente do corpo.',
    muscleGroup: 'peito',
    imageUrl: '/exercises/crossover-cabo.svg',
  },
  {
    id: 'crucifixo-halteres',
    name: 'Crucifixo com Halteres',
    description:
      'Deito no banco, braços abertos com leve flexão nos cotovelos. Traga os halteres até se encontrarem acima do peito.',
    muscleGroup: 'peito',
    imageUrl: '/exercises/crucifixo-halteres.svg',
  },
  {
    id: 'flexao-bracos',
    name: 'Flexão de Braços',
    description:
      'Mãos na largura dos ombros. Desça o corpo mantendo o core ativo e empurre de volta.',
    muscleGroup: 'peito',
    imageUrl: '/exercises/flexao-bracos.svg',
  },

  // COSTAS (6)
  {
    id: 'barra-fixa',
    name: 'Barra Fixa (Pull-up)',
    description:
      'Pendure-se na barra com pegada pronada. Puxe o corpo até o queixo ultrapassar a barra.',
    muscleGroup: 'costas',
    imageUrl: '/exercises/barra-fixa.svg',
  },
  {
    id: 'remada-curvada',
    name: 'Remada Curvada com Barra',
    description:
      'Incline o tronco para frente, joelhos levemente flexionados. Puxe a barra até o abdômen.',
    muscleGroup: 'costas',
    imageUrl: '/exercises/remada-curvada.svg',
  },
  {
    id: 'remada-unilateral-haltere',
    name: 'Remada Unilateral com Haltere',
    description: 'Apoie um joelho e mão no banco. Puxe o haltere com o braço livre até o quadril.',
    muscleGroup: 'costas',
    imageUrl: '/exercises/remada-unilateral-haltere.svg',
  },
  {
    id: 'puxada-frente',
    name: 'Puxada Frontal na Polia',
    description: 'Sentado, puxe a barra até a parte superior do peito. Controle o retorno.',
    muscleGroup: 'costas',
    imageUrl: '/exercises/puxada-frente.svg',
  },
  {
    id: 'remada-cavalinho',
    name: 'Remada Sentada (Cavalinho)',
    description: 'Sentado na máquina, puxe as alças até o abdômen mantendo as costas retas.',
    muscleGroup: 'costas',
    imageUrl: '/exercises/remada-cavalinho.svg',
  },
  {
    id: 'pullover-haltere',
    name: 'Pullover com Haltere',
    description:
      'Deite transversalmente no banco. Desça o haltere atrás da cabeça com braços semi-estendidos e retorne.',
    muscleGroup: 'costas',
    imageUrl: '/exercises/pullover-haltere.svg',
  },

  // PERNAS (8)
  {
    id: 'agachamento-livre',
    name: 'Agachamento Livre',
    description:
      'Barra nas costas, pés na largura dos ombros. Desça até as coxas ficarem paralelas ao chão e suba.',
    muscleGroup: 'pernas',
    imageUrl: '/exercises/agachamento-livre.svg',
  },
  {
    id: 'leg-press',
    name: 'Leg Press 45°',
    description:
      'Pés na plataforma na largura dos ombros. Desça até 90° e empurre de volta sem travar os joelhos.',
    muscleGroup: 'pernas',
    imageUrl: '/exercises/leg-press.svg',
  },
  {
    id: 'cadeira-extensora',
    name: 'Cadeira Extensora',
    description: 'Sentado na máquina, estenda as pernas até ficarem retas. Controle o retorno.',
    muscleGroup: 'pernas',
    imageUrl: '/exercises/cadeira-extensora.svg',
  },
  {
    id: 'mesa-flexora',
    name: 'Mesa Flexora',
    description:
      'Deitado de bruços, flexione os joelhos trazendo os calcanhares em direção aos glúteos.',
    muscleGroup: 'pernas',
    imageUrl: '/exercises/mesa-flexora.svg',
  },
  {
    id: 'stiff',
    name: 'Stiff (Levantamento Terra Romeno)',
    description:
      'Em pé com barra, desça mantendo as pernas semi-estendidas e costas retas. Suba contraindo os glúteos.',
    muscleGroup: 'pernas',
    imageUrl: '/exercises/stiff.svg',
  },
  {
    id: 'levantamento-terra',
    name: 'Levantamento Terra',
    description:
      'Pés na largura do quadril, segure a barra. Levante estendendo quadril e joelhos simultaneamente.',
    muscleGroup: 'pernas',
    imageUrl: '/exercises/levantamento-terra.svg',
  },
  {
    id: 'avanco-halteres',
    name: 'Avanço com Halteres',
    description: 'Dê um passo à frente e desça o joelho traseiro perto do chão. Alterne as pernas.',
    muscleGroup: 'pernas',
    imageUrl: '/exercises/avanco-halteres.svg',
  },
  {
    id: 'hack-squat',
    name: 'Hack Squat na Máquina',
    description:
      'Costas apoiadas na máquina, desça até 90° e empurre de volta. Pés posição média na plataforma.',
    muscleGroup: 'pernas',
    imageUrl: '/exercises/hack-squat.svg',
  },

  // OMBRO (5)
  {
    id: 'desenvolvimento-barra',
    name: 'Desenvolvimento com Barra',
    description:
      'Sentado ou em pé, empurre a barra acima da cabeça. Desça até a altura das orelhas.',
    muscleGroup: 'ombro',
    imageUrl: '/exercises/desenvolvimento-barra.svg',
  },
  {
    id: 'desenvolvimento-halteres',
    name: 'Desenvolvimento com Halteres',
    description:
      'Sentado, empurre os halteres acima da cabeça. Desça controladamente até a linha dos ombros.',
    muscleGroup: 'ombro',
    imageUrl: '/exercises/desenvolvimento-halteres.svg',
  },
  {
    id: 'elevacao-lateral',
    name: 'Elevação Lateral',
    description:
      'Em pé, eleve os braços lateralmente até a altura dos ombros. Cotovelos levemente flexionados.',
    muscleGroup: 'ombro',
    imageUrl: '/exercises/elevacao-lateral.svg',
  },
  {
    id: 'elevacao-frontal',
    name: 'Elevação Frontal',
    description:
      'Em pé, eleve os braços à frente do corpo até a altura dos ombros. Alterne ou faça simultâneo.',
    muscleGroup: 'ombro',
    imageUrl: '/exercises/elevacao-frontal.svg',
  },
  {
    id: 'face-pull',
    name: 'Face Pull na Polia',
    description:
      'Puxe a corda em direção ao rosto, abrindo os cotovelos. Foque na contração do deltoide posterior.',
    muscleGroup: 'ombro',
    imageUrl: '/exercises/face-pull.svg',
  },

  // BÍCEPS (5)
  {
    id: 'rosca-direta-barra',
    name: 'Rosca Direta com Barra',
    description:
      'Em pé, segure a barra com pegada supinada. Flexione os cotovelos trazendo a barra até os ombros.',
    muscleGroup: 'bíceps',
    imageUrl: '/exercises/rosca-direta-barra.svg',
  },
  {
    id: 'rosca-alternada-halteres',
    name: 'Rosca Alternada com Halteres',
    description:
      'Sentado ou em pé, alterne a flexão dos braços com halteres. Gire o punho durante o movimento.',
    muscleGroup: 'bíceps',
    imageUrl: '/exercises/rosca-alternada-halteres.svg',
  },
  {
    id: 'rosca-martelo',
    name: 'Rosca Martelo',
    description:
      'Halteres com pegada neutra (palmas para dentro). Flexione os braços sem girar o punho.',
    muscleGroup: 'bíceps',
    imageUrl: '/exercises/rosca-martelo.svg',
  },
  {
    id: 'rosca-banco-inclinado',
    name: 'Rosca no Banco Inclinado',
    description:
      'Sentado no banco inclinado, braços pendentes. Flexione os cotovelos trazendo os halteres aos ombros.',
    muscleGroup: 'bíceps',
    imageUrl: '/exercises/rosca-banco-inclinado.svg',
  },
  {
    id: 'rosca-concentrada',
    name: 'Rosca Concentrada',
    description:
      'Sentado, cotovelo apoiado na parte interna da coxa. Flexione o braço isoladamente.',
    muscleGroup: 'bíceps',
    imageUrl: '/exercises/rosca-concentrada.svg',
  },

  // TRÍCEPS (5)
  {
    id: 'triceps-polia-corda',
    name: 'Tríceps na Polia com Corda',
    description:
      'Em pé, empurre a corda para baixo estendendo os cotovelos. Abra a corda no final do movimento.',
    muscleGroup: 'tríceps',
    imageUrl: '/exercises/triceps-polia-corda.svg',
  },
  {
    id: 'triceps-testa-barra',
    name: 'Tríceps Testa com Barra',
    description:
      'Deitado, desça a barra em direção à testa estendendo os cotovelos. Mantenha os braços fixos.',
    muscleGroup: 'tríceps',
    imageUrl: '/exercises/triceps-testa-barra.svg',
  },
  {
    id: 'triceps-frances-haltere',
    name: 'Tríceps Francês com Haltere',
    description:
      'Sentado ou em pé, desça o haltere atrás da cabeça flexionando os cotovelos. Estenda de volta.',
    muscleGroup: 'tríceps',
    imageUrl: '/exercises/triceps-frances-haltere.svg',
  },
  {
    id: 'mergulho-paralelas',
    name: 'Mergulho nas Paralelas',
    description:
      'Apoie-se nas barras paralelas. Desça flexionando os cotovelos e empurre de volta. Tronco reto foca tríceps.',
    muscleGroup: 'tríceps',
    imageUrl: '/exercises/mergulho-paralelas.svg',
  },
  {
    id: 'triceps-polia-barra-v',
    name: 'Tríceps na Polia com Barra V',
    description:
      'Em pé, empurre a barra V para baixo estendendo os cotovelos. Mantenha os cotovelos colados ao corpo.',
    muscleGroup: 'tríceps',
    imageUrl: '/exercises/triceps-polia-barra-v.svg',
  },

  // CORE (5)
  {
    id: 'prancha-frontal',
    name: 'Prancha Frontal',
    description:
      'Apoie antebraços e pés no chão. Mantenha o corpo reto e o core contraído pelo tempo determinado.',
    muscleGroup: 'core',
    imageUrl: '/exercises/prancha-frontal.svg',
  },
  {
    id: 'abdominal-crise',
    name: 'Abdominal Crunch',
    description:
      'Deitado, joelhos flexionados. Eleve os ombros do chão contraindo o abdômen. Não puxe o pescoço.',
    muscleGroup: 'core',
    imageUrl: '/exercises/abdominal-crise.svg',
  },
  {
    id: 'abdominal-infra',
    name: 'Abdominal Infra',
    description:
      'Deitado, eleve as pernas retas até 90° e traga os joelhos ao peito. Desça controladamente.',
    muscleGroup: 'core',
    imageUrl: '/exercises/abdominal-infra.svg',
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    description:
      'Sentado com tronco inclinado e pés elevados, rotate o tronco tocando o chão de cada lado.',
    muscleGroup: 'core',
    imageUrl: '/exercises/russian-twist.svg',
  },
  {
    id: 'prancha-lateral',
    name: 'Prancha Lateral',
    description:
      'Apoie um antebraço no chão, corpo reto lateralmente. Mantenha a posição pelo tempo determinado.',
    muscleGroup: 'core',
    imageUrl: '/exercises/prancha-lateral.svg',
  },

  // GLÚTEOS (5)
  {
    id: 'elevacao-pelvica',
    name: 'Elevação Pélvica (Hip Thrust)',
    description:
      'Costas apoiadas no banco, barra no quadril. Eleve o quadril contraindo os glúteos no topo.',
    muscleGroup: 'glúteos',
    imageUrl: '/exercises/elevacao-pelvica.svg',
  },
  {
    id: 'agachamento-sumo',
    name: 'Agachamento Sumô',
    description:
      'Pés mais largos que os ombros, pontas para fora. Desça até as coxas ficarem paralelas ao chão.',
    muscleGroup: 'glúteos',
    imageUrl: '/exercises/agachamento-sumo.svg',
  },
  {
    id: 'passada-lateral',
    name: 'Passada Lateral',
    description:
      'Dê um passo largo lateralmente. Desça o peso na perna que avançou, mantendo a outra perna estendida.',
    muscleGroup: 'glúteos',
    imageUrl: '/exercises/passada-lateral.svg',
  },
  {
    id: 'coice-gluteo',
    name: 'Coice na Polia (Glute Kickback)',
    description:
      'Em quatro apoios ou na polia, estenda a perna para trás contraindo o glúteo no topo.',
    muscleGroup: 'glúteos',
    imageUrl: '/exercises/coice-gluteo.svg',
  },
  {
    id: 'abducao-quadril',
    name: 'Abdução de Quadril na Máquina',
    description:
      'Sentado na máquina, abra as pernas contra a resistência. Foque na contração dos glúteos laterais.',
    muscleGroup: 'glúteos',
    imageUrl: '/exercises/abducao-quadril.svg',
  },

  // PANTURRILHA (4)
  {
    id: 'panturrilha-em-pe',
    name: 'Panturrilha em Pé na Máquina',
    description:
      'Em pé na máquina, eleve os calcanhares o máximo possível. Desça controladamente até alongar.',
    muscleGroup: 'panturrilha',
    imageUrl: '/exercises/panturrilha-em-pe.svg',
  },
  {
    id: 'panturrilha-sentado',
    name: 'Panturrilha Sentado',
    description:
      'Sentado na máquina com joelhos flexionados. Eleve os calcanhares contraindo o sóleo.',
    muscleGroup: 'panturrilha',
    imageUrl: '/exercises/panturrilha-sentado.svg',
  },
  {
    id: 'panturrilha-unilateral',
    name: 'Panturrilha Unilateral com Haltere',
    description:
      'Em pé num degrau com um haltere. Eleve o calcanhar e desça até sentir o alongamento completo.',
    muscleGroup: 'panturrilha',
    imageUrl: '/exercises/panturrilha-unilateral.svg',
  },
  {
    id: 'panturrilha-leg-press',
    name: 'Panturrilha no Leg Press',
    description:
      'Pés na parte inferior da plataforma. Empurre com as pontas dos pés estendendo os tornozelos.',
    muscleGroup: 'panturrilha',
    imageUrl: '/exercises/panturrilha-leg-press.svg',
  },
]
