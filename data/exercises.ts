import type { ExerciseLibraryItem } from '~/types'

export const exerciseLibrary: ExerciseLibraryItem[] = [
  // PEITO (6)
  {
    id: 'supino-reto-barra',
    name: 'Supino Reto com Barra',
    description:
      'Deite no banco reto, segure a barra com pegada média. Desça até tocar o peito e empurre de volta.',
    muscleGroup: 'peito',
    gifUrl: 'https://media.giphy.com/media/2rPbCFqTlVov0J7d0X/giphy.gif',
  },
  {
    id: 'supino-inclinado-halteres',
    name: 'Supino Inclinado com Halteres',
    description:
      'Banco inclinado a 30-45°. Desça os halteres até a altura do peito e empurre para cima.',
    muscleGroup: 'peito',
    gifUrl: 'https://media.giphy.com/media/3oKIPa40rCRV26mjaQ/giphy.gif',
  },
  {
    id: 'supino-declinado',
    name: 'Supino Declinado',
    description:
      'Banco declinado. Desça a barra até a parte inferior do peito e empurre para cima.',
    muscleGroup: 'peito',
    gifUrl: 'https://media.giphy.com/media/9BZ9xj8qYR0s/giphy.gif',
  },
  {
    id: 'crossover-cabo',
    name: 'Crossover na Polia',
    description:
      'Em pé entre as polias altas, puxe as alças para frente e para baixo, unindo as mãos à frente do corpo.',
    muscleGroup: 'peito',
    gifUrl: 'https://media.giphy.com/media/l4FGIaELl5UF9R3Hi/giphy.gif',
  },
  {
    id: 'crucifixo-halteres',
    name: 'Crucifixo com Halteres',
    description:
      'Deito no banco, braços abertos com leve flexão nos cotovelos. Traga os halteres até se encontrarem acima do peito.',
    muscleGroup: 'peito',
    gifUrl: 'https://media.giphy.com/media/xT0GqFqp9rF53wFjfC/giphy.gif',
  },
  {
    id: 'flexao-bracos',
    name: 'Flexão de Braços',
    description:
      'Mãos na largura dos ombros. Desça o corpo mantendo o core ativo e empurre de volta.',
    muscleGroup: 'peito',
    gifUrl: 'https://media.giphy.com/media/KHsfGz6RQhOSg/giphy.gif',
  },

  // COSTAS (6)
  {
    id: 'barra-fixa',
    name: 'Barra Fixa (Pull-up)',
    description:
      'Pendure-se na barra com pegada pronada. Puxe o corpo até o queixo ultrapassar a barra.',
    muscleGroup: 'costas',
    gifUrl: 'https://media.giphy.com/media/2U5rEzjJMOQHbGZMOF/giphy.gif',
  },
  {
    id: 'remada-curvada',
    name: 'Remada Curvada com Barra',
    description:
      'Incline o tronco para frente, joelhos levemente flexionados. Puxe a barra até o abdômen.',
    muscleGroup: 'costas',
    gifUrl: 'https://media.giphy.com/media/l2Je66zG19GcVF27S/giphy.gif',
  },
  {
    id: 'remada-unilateral-haltere',
    name: 'Remada Unilateral com Haltere',
    description: 'Apoie um joelho e mão no banco. Puxe o haltere com o braço livre até o quadril.',
    muscleGroup: 'costas',
    gifUrl: 'https://media.giphy.com/media/26gJzFLDj0ZBor3zO/giphy.gif',
  },
  {
    id: 'puxada-frente',
    name: 'Puxada Frontal na Polia',
    description: 'Sentado, puxe a barra até a parte superior do peito. Controle o retorno.',
    muscleGroup: 'costas',
    gifUrl: 'https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif',
  },
  {
    id: 'remada-cavalinho',
    name: 'Remada Sentada (Cavalinho)',
    description: 'Sentado na máquina, puxe as alças até o abdômen mantendo as costas retas.',
    muscleGroup: 'costas',
    gifUrl: 'https://media.giphy.com/media/3oKIPnAia7AmPmR9Uk/giphy.gif',
  },
  {
    id: 'pullover-haltere',
    name: 'Pullover com Haltere',
    description:
      'Deite transversalmente no banco. Desça o haltere atrás da cabeça com braços semi-estendidos e retorne.',
    muscleGroup: 'costas',
    gifUrl: 'https://media.giphy.com/media/l0Ex6kDPwiMwp3JbO/giphy.gif',
  },

  // PERNAS (8)
  {
    id: 'agachamento-livre',
    name: 'Agachamento Livre',
    description:
      'Barra nas costas, pés na largura dos ombros. Desça até as coxas ficarem paralelas ao chão e suba.',
    muscleGroup: 'pernas',
    gifUrl: 'https://media.giphy.com/media/3oKIPuaM5WOKULwn2U/giphy.gif',
  },
  {
    id: 'leg-press',
    name: 'Leg Press 45°',
    description:
      'Pés na plataforma na largura dos ombros. Desça até 90° e empurre de volta sem travar os joelhos.',
    muscleGroup: 'pernas',
    gifUrl: 'https://media.giphy.com/media/l4FGJQm7lY0lSNaBq/giphy.gif',
  },
  {
    id: 'cadeira-extensora',
    name: 'Cadeira Extensora',
    description: 'Sentado na máquina, estenda as pernas até ficarem retas. Controle o retorno.',
    muscleGroup: 'pernas',
    gifUrl: 'https://media.giphy.com/media/xT0xeMA6lE0xw8RdAc/giphy.gif',
  },
  {
    id: 'mesa-flexora',
    name: 'Mesa Flexora',
    description:
      'Deitado de bruços, flexione os joelhos trazendo os calcanhares em direção aos glúteos.',
    muscleGroup: 'pernas',
    gifUrl: 'https://media.giphy.com/media/l0HlQ7LRalQWOtPBy/giphy.gif',
  },
  {
    id: 'stiff',
    name: 'Stiff (Levantamento Terra Romeno)',
    description:
      'Em pé com barra, desça mantendo as pernas semi-estendidas e costas retas. Suba contraindo os glúteos.',
    muscleGroup: 'pernas',
    gifUrl: 'https://media.giphy.com/media/2rPbCFqTlVov0J7d0X/giphy.gif',
  },
  {
    id: 'levantamento-terra',
    name: 'Levantamento Terra',
    description:
      'Pés na largura do quadril, segure a barra. Levante estendendo quadril e joelhos simultaneamente.',
    muscleGroup: 'pernas',
    gifUrl: 'https://media.giphy.com/media/2U7mAGsFO50SU/giphy.gif',
  },
  {
    id: 'avanco-halteres',
    name: 'Avanço com Halteres',
    description: 'Dê um passo à frente e desça o joelho traseiro perto do chão. Alterne as pernas.',
    muscleGroup: 'pernas',
    gifUrl: 'https://media.giphy.com/media/l4FGIYWG65p7nc7Xi/giphy.gif',
  },
  {
    id: 'hack-squat',
    name: 'Hack Squat na Máquina',
    description:
      'Costas apoiadas na máquina, desça até 90° e empurre de volta. Pés posição média na plataforma.',
    muscleGroup: 'pernas',
    gifUrl: 'https://media.giphy.com/media/3oKIPqH4OYdFDhHjhC/giphy.gif',
  },

  // OMBRO (5)
  {
    id: 'desenvolvimento-barra',
    name: 'Desenvolvimento com Barra',
    description:
      'Sentado ou em pé, empurre a barra acima da cabeça. Desça até a altura das orelhas.',
    muscleGroup: 'ombro',
    gifUrl: 'https://media.giphy.com/media/l0HlHFRnu3GaW03de/giphy.gif',
  },
  {
    id: 'desenvolvimento-halteres',
    name: 'Desenvolvimento com Halteres',
    description:
      'Sentado, empurre os halteres acima da cabeça. Desça controladamente até a linha dos ombros.',
    muscleGroup: 'ombro',
    gifUrl: 'https://media.giphy.com/media/2rPbCFqTlVov0J7d0X/giphy.gif',
  },
  {
    id: 'elevacao-lateral',
    name: 'Elevação Lateral',
    description:
      'Em pé, eleve os braços lateralmente até a altura dos ombros. Cotovelos levemente flexionados.',
    muscleGroup: 'ombro',
    gifUrl: 'https://media.giphy.com/media/xT0xeuOy2Ffa0ZuQDu/giphy.gif',
  },
  {
    id: 'elevacao-frontal',
    name: 'Elevação Frontal',
    description:
      'Em pé, eleve os braços à frente do corpo até a altura dos ombros. Alterne ou faça simultâneo.',
    muscleGroup: 'ombro',
    gifUrl: 'https://media.giphy.com/media/l4FGlBLdJ6w4amSjm/giphy.gif',
  },
  {
    id: 'face-pull',
    name: 'Face Pull na Polia',
    description:
      'Puxe a corda em direção ao rosto, abrindo os cotovelos. Foque na contração do deltoide posterior.',
    muscleGroup: 'ombro',
    gifUrl: 'https://media.giphy.com/media/l0Ex6kDPwiMwp3JbO/giphy.gif',
  },

  // BÍCEPS (5)
  {
    id: 'rosca-direta-barra',
    name: 'Rosca Direta com Barra',
    description:
      'Em pé, segure a barra com pegada supinada. Flexione os cotovelos trazendo a barra até os ombros.',
    muscleGroup: 'bíceps',
    gifUrl: 'https://media.giphy.com/media/l4FGl0YF7cJCMyF1m/giphy.gif',
  },
  {
    id: 'rosca-alternada-halteres',
    name: 'Rosca Alternada com Halteres',
    description:
      'Sentado ou em pé, alterne a flexão dos braços com halteres. Gire o punho durante o movimento.',
    muscleGroup: 'bíceps',
    gifUrl: 'https://media.giphy.com/media/3oKIPa40rCRV26mjaQ/giphy.gif',
  },
  {
    id: 'rosca-martelo',
    name: 'Rosca Martelo',
    description:
      'Halteres com pegada neutra (palmas para dentro). Flexione os braços sem girar o punho.',
    muscleGroup: 'bíceps',
    gifUrl: 'https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif',
  },
  {
    id: 'rosca-banco-inclinado',
    name: 'Rosca no Banco Inclinado',
    description:
      'Sentado no banco inclinado, braços pendentes. Flexione os cotovelos trazendo os halteres aos ombros.',
    muscleGroup: 'bíceps',
    gifUrl: 'https://media.giphy.com/media/xT0GqFqp9rF53wFjfC/giphy.gif',
  },
  {
    id: 'rosca-concentrada',
    name: 'Rosca Concentrada',
    description:
      'Sentado, cotovelo apoiado na parte interna da coxa. Flexione o braço isoladamente.',
    muscleGroup: 'bíceps',
    gifUrl: 'https://media.giphy.com/media/l4FGJQm7lY0lSNaBq/giphy.gif',
  },

  // TRÍCEPS (5)
  {
    id: 'triceps-polia-corda',
    name: 'Tríceps na Polia com Corda',
    description:
      'Em pé, empurre a corda para baixo estendendo os cotovelos. Abra a corda no final do movimento.',
    muscleGroup: 'tríceps',
    gifUrl: 'https://media.giphy.com/media/2rPbCFqTlVov0J7d0X/giphy.gif',
  },
  {
    id: 'triceps-testa-barra',
    name: 'Tríceps Testa com Barra',
    description:
      'Deitado, desça a barra em direção à testa estendendo os cotovelos. Mantenha os braços fixos.',
    muscleGroup: 'tríceps',
    gifUrl: 'https://media.giphy.com/media/l0HlHFRnu3GaW03de/giphy.gif',
  },
  {
    id: 'triceps-frances-haltere',
    name: 'Tríceps Francês com Haltere',
    description:
      'Sentado ou em pé, desça o haltere atrás da cabeça flexionando os cotovelos. Estenda de volta.',
    muscleGroup: 'tríceps',
    gifUrl: 'https://media.giphy.com/media/xT0xeuOy2Ffa0ZuQDu/giphy.gif',
  },
  {
    id: 'mergulho-paralelas',
    name: 'Mergulho nas Paralelas',
    description:
      'Apoie-se nas barras paralelas. Desça flexionando os cotovelos e empurre de volta. Tronco reto foca tríceps.',
    muscleGroup: 'tríceps',
    gifUrl: 'https://media.giphy.com/media/2U5rEzjJMOQHbGZMOF/giphy.gif',
  },
  {
    id: 'triceps-polia-barra-v',
    name: 'Tríceps na Polia com Barra V',
    description:
      'Em pé, empurre a barra V para baixo estendendo os cotovelos. Mantenha os cotovelos colados ao corpo.',
    muscleGroup: 'tríceps',
    gifUrl: 'https://media.giphy.com/media/l4FGlBLdJ6w4amSjm/giphy.gif',
  },

  // CORE (5)
  {
    id: 'prancha-frontal',
    name: 'Prancha Frontal',
    description:
      'Apoie antebraços e pés no chão. Mantenha o corpo reto e o core contraído pelo tempo determinado.',
    muscleGroup: 'core',
    gifUrl: 'https://media.giphy.com/media/xT5LMTT4e8mMfqb3Ve/giphy.gif',
  },
  {
    id: 'abdominal-crise',
    name: 'Abdominal Crunch',
    description:
      'Deitado, joelhos flexionados. Eleve os ombros do chão contraindo o abdômen. Não puxe o pescoço.',
    muscleGroup: 'core',
    gifUrl: 'https://media.giphy.com/media/KHsfGz6RQhOSg/giphy.gif',
  },
  {
    id: 'abdominal-infra',
    name: 'Abdominal Infra',
    description:
      'Deitado, eleve as pernas retas até 90° e traga os joelhos ao peito. Desça controladamente.',
    muscleGroup: 'core',
    gifUrl: 'https://media.giphy.com/media/l4FGIaELl5UF9R3Hi/giphy.gif',
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    description:
      'Sentado com tronco inclinado e pés elevados, rotate o tronco tocando o chão de cada lado.',
    muscleGroup: 'core',
    gifUrl: 'https://media.giphy.com/media/l0Ex6kDPwiMwp3JbO/giphy.gif',
  },
  {
    id: 'prancha-lateral',
    name: 'Prancha Lateral',
    description:
      'Apoie um antebraço no chão, corpo reto lateralmente. Mantenha a posição pelo tempo determinado.',
    muscleGroup: 'core',
    gifUrl: 'https://media.giphy.com/media/xT0GqFqp9rF53wFjfC/giphy.gif',
  },

  // GLÚTEOS (5)
  {
    id: 'elevacao-pelvica',
    name: 'Elevação Pélvica (Hip Thrust)',
    description:
      'Costas apoiadas no banco, barra no quadril. Eleve o quadril contraindo os glúteos no topo.',
    muscleGroup: 'glúteos',
    gifUrl: 'https://media.giphy.com/media/l4FGJQm7lY0lSNaBq/giphy.gif',
  },
  {
    id: 'agachamento-sumo',
    name: 'Agachamento Sumô',
    description:
      'Pés mais largos que os ombros, pontas para fora. Desça até as coxas ficarem paralelas ao chão.',
    muscleGroup: 'glúteos',
    gifUrl: 'https://media.giphy.com/media/3oKIPuaM5WOKULwn2U/giphy.gif',
  },
  {
    id: 'passada-lateral',
    name: 'Passada Lateral',
    description:
      'Dê um passo largo lateralmente. Desça o peso na perna que avançou, mantendo a outra perna estendida.',
    muscleGroup: 'glúteos',
    gifUrl: 'https://media.giphy.com/media/l4FGIYWG65p7nc7Xi/giphy.gif',
  },
  {
    id: 'coice-gluteo',
    name: 'Coice na Polia (Glute Kickback)',
    description:
      'Em quatro apoios ou na polia, estenda a perna para trás contraindo o glúteo no topo.',
    muscleGroup: 'glúteos',
    gifUrl: 'https://media.giphy.com/media/l0HlQ7LRalQWOtPBy/giphy.gif',
  },
  {
    id: 'abducao-quadril',
    name: 'Abdução de Quadril na Máquina',
    description:
      'Sentado na máquina, abra as pernas contra a resistência. Foque na contração dos glúteos laterais.',
    muscleGroup: 'glúteos',
    gifUrl: 'https://media.giphy.com/media/3oKIPqH4OYdFDhHjhC/giphy.gif',
  },

  // PANTURRILHA (4)
  {
    id: 'panturrilha-em-pe',
    name: 'Panturrilha em Pé na Máquina',
    description:
      'Em pé na máquina, eleve os calcanhares o máximo possível. Desça controladamente até alongar.',
    muscleGroup: 'panturrilha',
    gifUrl: 'https://media.giphy.com/media/xT0xeMA6lE0xw8RdAc/giphy.gif',
  },
  {
    id: 'panturrilha-sentado',
    name: 'Panturrilha Sentado',
    description:
      'Sentado na máquina com joelhos flexionados. Eleve os calcanhares contraindo o sóleo.',
    muscleGroup: 'panturrilha',
    gifUrl: 'https://media.giphy.com/media/l4FGl0YF7cJCMyF1m/giphy.gif',
  },
  {
    id: 'panturrilha-unilateral',
    name: 'Panturrilha Unilateral com Haltere',
    description:
      'Em pé num degrau com um haltere. Eleve o calcanhar e desça até sentir o alongamento completo.',
    muscleGroup: 'panturrilha',
    gifUrl: 'https://media.giphy.com/media/l4FGlBLdJ6w4amSjm/giphy.gif',
  },
  {
    id: 'panturrilha-leg-press',
    name: 'Panturrilha no Leg Press',
    description:
      'Pés na parte inferior da plataforma. Empurre com as pontas dos pés estendendo os tornozelos.',
    muscleGroup: 'panturrilha',
    gifUrl: 'https://media.giphy.com/media/l4FGJQm7lY0lSNaBq/giphy.gif',
  },
]
