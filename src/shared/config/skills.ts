const physical = {
  athletics: {
    id: "athletics",
    label: "ATLETISMO",
    bases: ["strength", "constitution"],
    description:
      "A aplicação bruta da física corporal. Necessário para escalar superfícies, saltar vãos, nadar ou manter um ritmo de corrida por longas distâncias.",
  },
  exotic_weapons: {
    id: "exotic_weapons",
    label: "ARMAS EXÓTICAS",
    bases: ["dexterity", "strength"],
    description:
      "O manuseio de ferramentas de destruição não convencionais, como foices, motosserras e correntes. Tamanho limitado pela complexidade do armamento ou nível da perícia.",
  },
  firearms_small: {
    id: "firearms_small",
    label: "ARMAS DE FOGO (PEQUENO PORTE)",
    bases: ["dexterity", "instinct"],
    description:
      "A competência com pistolas, revólveres e submetralhadoras. Exige coordenação manual fina e reflexos rápidos para o disparo instintivo.",
  },
  firearms_medium: {
    id: "firearms_medium",
    label: "ARMAS DE FOGO (MÉDIO PORTE)",
    bases: ["dexterity"],
    description:
      "O domínio de fuzis de assalto, escopetas e rifles. Foca na postura de tiro, mira e operação mecânica correta do armamento.",
  },
  lockpick: {
    id: "lockpick",
    label: "ARROMBAMENTO",
    bases: ["dexterity", "instinct"],
    description:
      "A manipulação delicada de mecanismos de segurança. Exige mãos firmes e conhecimento técnico o funcionamento interno de fechaduras e trancas.",
  },
  throwing: {
    id: "throwing",
    label: "ARREMESSO",
    bases: ["strength", "dexterity"],
    description:
      "A capacidade de calcular a trajetória e lançar objetos — sejam granadas, facas ou pedras — com precisão e potência.",
  },
  street_fighting: {
    id: "street_fighting",
    label: "BRIGA DE RUA",
    bases: ["strength"],
    description:
      "O combate desarmado, sujo e pragmático. Socos, chutes imobilizações brutais sem técnica.",
  },
  blunt_short: {
    id: "blunt_short",
    label: "CONTUNDENTES (CURTOS)",
    bases: ["strength"],
    description:
      "O uso eficiente de armas de impacto de uma mão, como cassetetes, martelos e chaves inglesas.",
  },
  blunt_medium: {
    id: "blunt_medium",
    label: "CONTUNDENTES (MÉDIOS)",
    bases: ["strength", "dexterity"],
    description:
      "O uso de armas de impacto mais pesadas que podem ser usadas com uma ou duas mãos, como tacos de beisebol ou bastões retráteis.",
  },
  blades_short: {
    id: "blades_short",
    label: "LÂMINAS (CURTAS)",
    bases: ["dexterity"],
    description:
      "A letalidade em curta distância com facas, canivetes e adagas. Foca em estocadas rápidas e cortes arteriais.",
  },
  blades_medium: {
    id: "blades_medium",
    label: "LÂMINAS (MÉDIAS)",
    bases: ["strength", "dexterity"],
    description:
      "O combate com lâminas de maior alcance e peso, como espadas curtas, facões e machadinhas.",
  },
  light_hands: {
    id: "light_hands",
    label: "MÃOS LEVES",
    bases: ["dexterity"],
    description:
      "Furtar bolsos, plantar objetos ou realizar truques manuais sem ser notado pela vítima",
  },
  maneuvers: {
    id: "maneuvers",
    label: "MANOBRAS",
    bases: ["dexterity", "strength"],
    description:
      "Usada para amortecer quedas, realizar parkour, e atravessar obstáculos sem perder o ímpeto.",
  },
  immune_resistance: {
    id: "immune_resistance",
    label: "RESISTÊNCIA IMUNOLÓGICA",
    bases: ["constitution"],
    description:
      "A resiliência biológica interna. A capacidade do seu sistema de combater toxinas, doenças e infecções.",
  },
  natural_resistance: {
    id: "natural_resistance",
    label: "RESISTÊNCIA NATURAL",
    bases: ["constitution"],
    description:
      "Seu corpo suporta o frio extremo, a fome e o desconforto melhor que a média.",
  },
  tolerance: {
    id: "tolerance",
    label: "TOLERÂNCIA",
    bases: ["constitution", "instinct"],
    description:
      "Permite continuar agindo e lutando mesmo quando seu corpo grita de dor por ferimentos graves.",
  },
};

const mental = {
  traps: {
    id: "traps",
    label: "ARMADILHAS",
    bases: ["instinct", "intelligence"],
    description:
      "Identificar locais propícios, criar dispositivos improvisados e armar ou desarmar armadilhas letais.",
  },
  gunsmithing: {
    id: "gunsmithing",
    label: "ARMEIRO",
    bases: ["intelligence", "dexterity"],
    description:
      "Conhecimento técnico sobre balística, manutenção, reparo e modificação de armas de fogo.",
  },
  arts: {
    id: "arts",
    label: "ARTES",
    bases: ["wisdom", "dexterity"],
    description:
      "Pintar, escrever ou esculpir obras que podem servir como mercadoria de luxo ou mensagens simbólicas.",
  },
  self_control: {
    id: "self_control",
    label: "AUTOCONTROLE",
    bases: ["wisdom", "instinct"],
    description:
      "A fortaleza mental e o instinto domado pela razão. Permitindo se manter sempre calmo e resistir a iscas psicológica ou físicas além de ocultar reações de dor ou emoções.",
  },
  camouflage: {
    id: "camouflage",
    label: "CAMUFLAGEM",
    bases: ["intelligence", "wisdom"],
    description:
      "Criar disfarces, modificar a aparência de objetos ou utilizar o ambiente para se ocultar da vista.",
  },
  concentration: {
    id: "concentration",
    label: "CONCENTRAÇÃO",
    bases: ["wisdom", "constitution"],
    description:
      "Capacidade de bloquear distrações externas para realizar tarefas complexas. A cada ponto, o jogador cria uma Especialização que concede bônus em uma perícia específica quando usada de forma concentrada.",
  },
  cooking: {
    id: "cooking",
    label: "CULINÁRIA",
    bases: ["wisdom"],
    description:
      "Tornar ingredientes questionáveis em algo comestível e seguro, extraindo o máximo de nutrição (e algum sabor) do que antes era considerado lixo ou intragável.",
  },
  electronics: {
    id: "electronics",
    label: "ELETRÔNICA",
    bases: ["intelligence", "dexterity"],
    description:
      "Compreensão de circuitos e sistemas elétricos. Usada para reparar dispositivos ou contornar segurança eletrônica física.",
  },
  encyclopedia: {
    id: "encyclopedia",
    label: "ENCICLOPÉDIA",
    bases: ["intelligence"],
    description:
      "Conhecimento vasto sobre fatos concretos (geografia, biologia, história, etc.) livre de propaganda. Habilidade necessária para encontrar informações úteis em bibliotecas, bancos de dados ou similares.",
  },
  engineering: {
    id: "engineering",
    label: "ENGENHARIA",
    bases: ["intelligence", "wisdom"],
    description:
      "Projetar construções, produtos, armas ou novas invenções. Entender plantas complexas e saber exatamente onde bater para derrubar um prédio.",
  },
  explosives: {
    id: "explosives",
    label: "EXPLOSIVOS",
    bases: ["intelligence", "dexterity"],
    description:
      "Fabricar compostos voláteis, implantar cargas de forma estrutural e desarmar bombas com segurança.",
  },
  falsification: {
    id: "falsification",
    label: "FALSIFICAÇÃO",
    bases: ["intelligence", "manipulation"],
    description:
      "Produzir documentos, credenciais ou itens falsos indistinguíveis dos originais para olhos não treinados.",
  },
  stealth: {
    id: "stealth",
    label: "FURTIVIDADE",
    bases: ["dexterity", "instinct"],
    description:
      "Saber quando se mover e como pisar para não produzir som, tornando-se invisível aos sentidos alheios.",
  },
  hacking: {
    id: "hacking",
    label: "HACKING",
    bases: ["intelligence"],
    description:
      "Invadir sistemas corporativos, quebrar criptografias e manipular dados. Inclui o hacking físico de terminais.",
  },
  instruments: {
    id: "instruments",
    label: "INSTRUMENTOS MUSICAIS",
    bases: ["dexterity", "wisdom"],
    description:
      "Saber tocar instrumentos para entretenimento, lucro ou para recuperar o moral do grupo em momentos sombrios.",
  },
  investigation: {
    id: "investigation",
    label: "INVESTIGAÇÃO",
    bases: ["intelligence", "wisdom"],
    description:
      "Analisar cenas de crime, conectar evidências e reconstruir eventos passados através de pistas.",
  },
  mechanics: {
    id: "mechanics",
    label: "MECÂNICA",
    bases: ["intelligence", "strength"],
    description:
      "Consertar motores, geradores, sistemas hidráulicos ou maquinários complexos.",
  },
  medicine: {
    id: "medicine",
    label: "MEDICINA",
    bases: ["intelligence", "wisdom"],
    description:
      "Realizar cirurgias, tratar doenças sistêmicas e gerenciar a recuperação de traumas a longo prazo. A cada dois pontos, adicione +1 nas rolagens de Primeiros Socorros.",
  },
  navigation: {
    id: "navigation",
    label: "NAVEGAÇÃO",
    bases: ["wisdom", "instinct"],
    description:
      "A orientação espacial. Ler mapas, usar bússolas e encontrar o caminho em terrenos desconhecidos.",
  },
  crafts: {
    id: "crafts",
    label: "OFÍCIOS MANUAIS",
    bases: ["dexterity", "intelligence"],
    description:
      "Carpintaria, costura, alvenaria e reparos gerais em itens que não exigem conhecimento avançado.",
  },
  first_aid: {
    id: "first_aid",
    label: "PRIMEIROS SOCORROS",
    bases: ["wisdom", "instinct"],
    description:
      "Estancar hemorragias, estabilizar fraturas e impedir a morte imediata no campo de batalha.",
  },
  searching: {
    id: "searching",
    label: "PROCURA",
    bases: ["intelligence", "instinct"],
    description:
      "Usar intuição e método para encontrar itens escondidos, passagens secretas ou saques em um ambiente caótico.",
  },
  chemistry: {
    id: "chemistry",
    label: "QUÍMICA",
    bases: ["intelligence", "wisdom"],
    description:
      "Saber como identificar e manipular químicos com segurança. Analizar substâncias desconhecidas e sintetizar compostos úteis.",
  },
  tracking: {
    id: "tracking",
    label: "RASTREIO",
    bases: ["instinct", "wisdom"],
    description:
      "Ler o ambiente para identificar e seguir pegadas, sinais de passagem e localizar alvos sem ser detectado.",
  },
  survival: {
    id: "survival",
    label: "SOBREVIVÊNCIA",
    bases: ["wisdom", "constitution"],
    description:
      "Saber como encontrar e purificar água, caçar, construir abrigos térmicos, encontrar comida e fazer fogo em condições adversas.",
  },
  vehicles: {
    id: "vehicles",
    label: "VEÍCULOS",
    bases: ["wisdom", "instinct"],
    description:
      "Dirigir carros, motos e caminhões de forma competente e realizar a manutenção preventiva básica.",
  },
  exotic_machines: {
    id: "exotic_machines",
    label: "MÁQUINAS EXÓTICAS",
    bases: ["intelligence", "instinct"],
    description:
      "Operar máquinas complexas que não seguem uma lógica comum (ex: tanques, drones pesados ou maquinário industrial) e mantê-las funcionais.",
  },
};

const socials = {
  contacts: {
    id: "contacts",
    label: "CONTATOS",
    bases: ["charisma"],
    description:
      "A cada ponto investido nesta perícia, o jogador define um NPC específico como contato a discutir com o MD.",
  },
  persuasion: {
    id: "persuasion",
    label: "CONVENCIMENTO",
    bases: ["wisdom", "manipulation"],
    description:
      "A persuasão lógica. Convencer outros através de argumentos racionais e fatos reais ou manipulados.",
  },
  popular_culture: {
    id: "popular_culture",
    label: "CULTURA POPULAR",
    bases: ["intelligence", "charisma"],
    description:
      "Saber sobre rumores, hierarquias, acontecimentos, celebridades locais e o fluxo social de uma comunidade.",
  },
  politics: {
    id: "politics",
    label: "POLÍTICA",
    bases: ["charisma"],
    description:
      "Estabelecer tratados, oferecer propostas comerciais e o uso da diplomacia.",
  },
  distraction: {
    id: "distraction",
    label: "DISTRAÇÃO",
    bases: ["intelligence", "manipulation"],
    description:
      "Criar tumultos ou cenas calculadas para desviar a atenção de observadores.",
  },
  education: {
    id: "education",
    label: "EDUCAÇÃO",
    bases: ["intelligence", "charisma"],
    description:
      "Saber se portar adequadamente em diferentes escalas sociais, desde uma apresentação bem sucedida até reuniões de chefes do crime e jantares corporativos.",
  },
  animal_empathy: {
    id: "animal_empathy",
    label: "EMPATIA COM ANIMAIS",
    bases: ["instinct", "charisma"],
    description:
      "Acalmar, treinar, domar ou criar laços de confiança com animais.",
  },
  intimidation: {
    id: "intimidation",
    label: "INTIMIDAÇÃO",
    bases: ["manipulation"],
    description:
      "A coação pelo medo. Quebrar a vontade de alvos através de ameaças físicas ou psicológicas.",
  },
  gambling: {
    id: "gambling",
    label: "JOGOS DE AZAR",
    bases: ["manipulation", "intelligence"],
    description:
      "Entender probabilidades de apostas e executar trapaças psicológicas em jogos.",
  },
  corp_language: {
    id: "corp_language",
    label: "LINGUAGEM DOS CORPS",
    bases: ["wisdom", "manipulation"],
    description:
      "A compreenção da Burocracia e Etiqueta Corporativa. Habilidade de entender o mínimo da línguagem corporativa usada para navegar nos sistemas, preencher formulários e intimidar pessoas leigas através de tecnicalidades.",
  },
  lying: {
    id: "lying",
    label: "MENTIR",
    bases: ["manipulation", "intelligence"],
    description:
      "Construir e sustentar mentiras simples ou complexas sob pressão.",
  },
  cold_reading: {
    id: "cold_reading",
    label: "LEITURA FRIA",
    bases: ["wisdom", "instinct"],
    description:
      "Analisar microexpressões e tons de voz para detectar mentiras, nervosismo ou intenções ocultas.",
  },
  seduction: {
    id: "seduction",
    label: "SEDUÇÃO",
    bases: ["charisma", "manipulation"],
    description:
      "Usar do charme e atração para manipular emocionalmente e fingir sentimentos.",
  },
};

export const SKILLS = {
  PHYSICAL: physical,
  MENTAL: mental,
  SOCIAL: socials,
} as const;
