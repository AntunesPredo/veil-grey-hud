export const PLAYER_ROLES = {
  hard_worker: {
    id: "hard_worker",
    title: "OPERÁRIO",
    subtitle: "Você é a mão que constrói o futuro no inferno congelado.",
    description:
      "Seu trabalho seria operar maquinário pesado, manter geradores funcionando e sobreviver a turnos de 18 horas no frio extremo, fora da segurança das cidades.",
    photoUrl: new URL(
      "../../assets/images/roles/hardworker.png",
      import.meta.url,
    ).href,
    initialItem: "Kit de Sobrevivência Nv2",
    uniqueAbility: {
      title: "Bloqueio Mental",
      description:
        "Você desliga uma parte de si mesmo para se manter útil. Pode optar por anular alguma penalidade ambiental em troca de Pontos de Loucura fixos que requerem ações específicas para serem removidos. Quantidade de pontos e ações necessárias para remoção ficam a cargo do MD.",
    },
    initialStats: {
      attributes: { constitution: 4, strength: 3, instinct: 2 },
      baseSkills: ["athletics", "blunt_medium", "natural_resistance"],
    },
  },

  hacker: {
    id: "hacker",
    title: "ANALISTA DE DADOS",
    subtitle: "Você vive no mundo virtual.",
    description:
      "Sua mente seria um recurso valioso na otimização de sistemas de IA ou na análise de dados logísticos para as megacorporações. Suas habilidades são perigosas em um mundo onde somente a elite tem acesso a essa tecnologia.",
    photoUrl: new URL("../../assets/images/roles/hacker.png", import.meta.url)
      .href,
    initialItem: "Notebook Quebrado",
    uniqueAbility: {
      title: "Fantasma na Rede",
      description:
        "Quando você presencialmente invade um sistema, a cada 2 pontos acima da dificuldade é instalado um 'Honey Pot', que desvia a atenção e dificulta o rastreamento. A cada Honey Pot instalado diminui em 1 a dificuldade de Hackings posteriores. Críticos Negativos excluem todos os Honey Pots.",
    },
    initialStats: {
      attributes: { intelligence: 4, wisdom: 3, manipulation: 2 },
      baseSkills: ["hacking", "investigation", "corp_language"],
    },
  },

  bodyguard: {
    id: "bodyguard",
    title: "AGENTE DE SEGURANÇA",
    subtitle: "Você gosta de manter as pessoas seguras.",
    description:
      "Você seria um segurança ou um oficial de elite, mantendo a paz e a ordem dentro das muralhas de uma megacidade ou protegendo algum Acionista que te pagaria muito bem.",
    photoUrl: new URL(
      "../../assets/images/roles/bodyguard.png",
      import.meta.url,
    ),
    initialItem: "Colete Balístico Nv1",
    uniqueAbility: {
      title: "Paranoia Constante",
      description:
        "Você sente que está sendo caçado. Uma vez por combate pode ser o primeiro a agir em troca de 2 Ponto de Loucura. Após o uso, interações sociais tem penalidade de -3 até o próximo descanso.",
    },
    initialStats: {
      attributes: { dexterity: 4, instinct: 3, strength: 2 },
      baseSkills: ["street_fighting", "blunt_short", "firearms_small"],
    },
  },

  nurse: {
    id: "nurse",
    title: "ENFERMEIRO",
    subtitle: "Você cuida bem das pessoas.",
    description:
      "Seu trabalho seria auxiliar algum grupo de médicos famosos e experientes em hospitais de alta tecnologia com os melhores materiais e equipamentos do mundo ou até mesmo se tornar um desses médicos no futuro.",
    photoUrl: new URL("../../assets/images/roles/nurse.png", import.meta.url)
      .href,
    initialItem: "Kit Primeiros Socorros Nv1 + Poucos Medicamentos",
    uniqueAbility: {
      title: "Estabilização Rápida",
      description:
        "Suas mãos são precisas e eficientes sob pressão. Ao usar a perícia Primeiros Socorros ou Medicina para estabilizar alguém pode rodar 2 dados e manter o maior valor em troca de 2 Pontos de Loucura causado pelo estresse. Cada uso subsequente aumenta em +1 a contagem de Pontos de Loucura. A contagem reinicia após um descanso completo.",
    },
    initialStats: {
      attributes: { wisdom: 4, instinct: 3, constitution: 2 },
      baseSkills: ["immune_resistance", "first_aid", "concentration"],
    },
  },

  scientist: {
    id: "scientist",
    title: "CIENTISTA",
    subtitle: "Você é a personificação da vontade do saber.",
    description:
      "Seu trabalho seria ficar trancado em laboratórios estéreis por dias a fio, analisando amostras, desenvolvendo novos compostos químicos ou modificando dados biológicos para as Megacorporações.",
    photoUrl: new URL(
      "../../assets/images/roles/scientist.png",
      import.meta.url,
    ).href,
    initialItem: "Kit de Química Nv2",
    uniqueAbility: {
      title: "Análise Forense",
      description:
        "Você consegue ver padrões invisíveis para os outros. Adiciona metade do seu Nível de Inteligência ao resultado de testes relacionado a Buscas em troca de 1d3 Pontos de Loucura por teste.",
    },
    initialStats: {
      attributes: { intelligence: 4, wisdom: 3, instinct: 2 },
      baseSkills: ["encyclopedia", "chemistry", "investigation"],
    },
  },

  preacher: {
    id: "preacher",
    title: "PREGADOR",
    subtitle: "Você da motivação para as pessoas.",
    description:
      "Você seria o líder de um pequeno grupo religioso, um orador motivacional corporativo ou somente tem o objetivo de espalhar sua crença até os confins do mundo. Você não usa lógica ou o carisma como o Comunicador; você usa fervor, medo ou dogma para mover as pessoas.",
    photoUrl: new URL("../../assets/images/roles/preacher.png", import.meta.url)
      .href,
    initialItem: "Item Religioso",
    uniqueAbility: {
      title: "Seguidor Leal",
      description:
        "Você começa o jogo com um seguidor NPC leal. Este seguidor é não combatente mas fará qualquer tarefa mundana ou de baixo risco por devoção a você. Se ele morrer, você deve gastar tempo e realizar testes a cargo do MD para 'converter' um novo.",
    },
    initialStats: {
      attributes: { manipulation: 4, wisdom: 3, intelligence: 2 },
      baseSkills: ["intimidation", "distraction", "persuasion"],
    },
  },

  builder: {
    id: "builder",
    title: "CONSTRUTOR",
    subtitle: "Você cria coisas incríveis.",
    description:
      "Você seria muito bem utilizado na criação dos mais diversos itens para as Megacorporações. De produtos de uso comum a colisores de átomos, o céu é o limite para a sua capacidade se bem explorada e apoiado pelas pessoas certas.",
    photoUrl: new URL("../../assets/images/roles/builder.png", import.meta.url)
      .href,
    initialItem: "Kit de Ferramentas Nv2",
    uniqueAbility: {
      title: "Mãos Mágicas",
      description:
        "Você pode 'acumular' pontos excedentes de testes bem sucedidos para utilizá-los posteriormente em testes que não atingiram o resultado esperado da mesma perícia. Limitado a metade do nível da perícia e somente válido para as perícias iniciais da função Construtor.",
    },
    initialStats: {
      attributes: { intelligence: 4, dexterity: 3, strength: 2 },
      baseSkills: ["mechanics", "gunsmithing", "crafts"],
    },
  },

  smuggler: {
    id: "smuggler",
    title: "CONTRABANDISTA",
    subtitle: "Você gosta do perigo.",
    description:
      "Seu objetivo seria abandonar a vida perigosa e conseguir um cargo estável e seguro em alguma loja ou continuar seu 'Trabalho Honesto' no interior das muralhas do CPNC.",
    photoUrl: new URL("../../assets/images/roles/smuggler.png", import.meta.url)
      .href,
    initialItem: "Contrabando e Mochila Nv2 (com fundo falso)",
    uniqueAbility: {
      title: "Carga Oculta",
      description:
        "Você automaticamente passa em testes para ocultar itens de tamanho Pequeno ou Médio (condicional) em seu corpo, veículo ou ambiente. Ao presenciar testes de Busca em seus esconderijos pode iniciar um Combate Social imediato para evitar a procura.",
    },
    initialStats: {
      attributes: { intelligence: 4, manipulation: 3, dexterity: 2 },
      baseSkills: ["gambling", "light_hands", "falsification"],
    },
  },

  fighter: {
    id: "fighter",
    title: "LUTADOR",
    subtitle: "Você sabe como bater nas pessoas.",
    description:
      "Ganhar a vida em clubes de luta clandestina te ensinou muita coisa, talvez no novo mundo você possa ser uma pessoa famosa e reconhecida do esporte e parar de se machucar por trocados.",
    photoUrl: new URL("../../assets/images/roles/fighter.png", import.meta.url)
      .href,
    initialItem: "Livro de um estilo de luta",
    uniqueAbility: {
      title: "Imunidade a Dor",
      description:
        "Os efeitos dos estados Machucado e Muito Machucado são reduzidos pela metade em troca de 2 Ponto de Loucura ou totalmente ignorados em troca de 1d4 Pontos de Loucura.",
    },
    initialStats: {
      attributes: { strength: 4, instinct: 3, constitution: 2 },
      baseSkills: ["tolerance", "street_fighting", "natural_resistance"],
    },
  },

  communicator: {
    id: "communicator",
    title: "COMUNICADOR",
    subtitle: "Você sabe como lidar com as pessoas.",
    description:
      "Como um executivo de relações públicas ou marketing, você moldaria a imagem do Novo Canadá para o mundo ou seria responsável por mostrar as noticias do dia como um apresentador famoso.",
    photoUrl: new URL(
      "../../assets/images/roles/communicator.png",
      import.meta.url,
    ).href,
    initialItem: "Celular Modificado + Fone de Ouvido",
    uniqueAbility: {
      title: "Centro das Atenções",
      description:
        "Você sabe como dominar uma conversa desde o primeiro segundo. Pode escolher uma Perícia Social já conhecida para obter um modificador +2 durante um Combate Social. Limitado a uma uso por dia.",
    },
    initialStats: {
      attributes: { charisma: 4, intelligence: 3, manipulation: 2 },
      baseSkills: ["seduction", "lying", "education"],
    },
  },

  rejected: {
    id: "rejected",
    title: "REJEITADO",
    subtitle: "Não existe um mundo ideal para você.",
    description:
      "Qualquer lugar é melhor que o inferno que deixou para trás. Você não tinha uma carreira definida; você simplesmente sobreviveu.",
    photoUrl: new URL("../../assets/images/roles/rejected.png", import.meta.url)
      .href,
    initialItem: "Nenhum",
    uniqueAbility: {
      title: "Nenhuma",
      description: "Nenhuma",
    },
    initialStats: {
      attributes: { free_points: 7 },
      baseSkills: [],
      skillPoints: { free_points: 4 },
    },
  },
} as const;
