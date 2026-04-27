import type { Disadvantage } from "../types/veil-grey";

export const SYSTEM_DISADVANTAGES: Record<
  string,
  { label: string; items: Disadvantage[] }
> = {
  physical: {
    label: "FÍSICAS E AMBIENTAIS",
    items: [
      {
        id: "viciado",
        categoryId: "physical",
        title: "Viciado",
        description:
          "Dependente de uma substância. Sofre penalidades progressivas se não a consumir causada pela abstinência. Pode iniciar com uma dose de sua droga, a critério do MD.",
        effects: [],
      },
      {
        id: "sangue_fino",
        categoryId: "physical",
        title: "Sangue Fino",
        description:
          "Seu corpo é inadequado para o frio. Testes para resistir aos efeitos de Hipotermia ou danos elementais de Gelo recebem penalidade de -2.",
        effects: [
          {
            id: 0,
            target: "natural_resistance",
            val: -2,
            mode: "OPTIONAL",
            description: "Sangue Fino",
            link: "FLAW",
          },
        ],
      },
      {
        id: "alergia",
        categoryId: "physical",
        title: "Alergia",
        description:
          "Você tem uma reação alérgica a uma substância comum. O contato causa uma penalidade de -4 em todos os testes.",
        effects: [
          {
            id: 0,
            target: "ATT_PHYSICAL",
            val: -4,
            mode: "OPTIONAL",
            description: "Reação Alérgica",
            link: "FLAW",
          },
          {
            id: 1,
            target: "ATT_MENTAL",
            val: -4,
            mode: "OPTIONAL",
            description: "Reação Alérgica",
            link: "FLAW",
          },
        ],
      },
      {
        id: "tosse_congelado",
        categoryId: "physical",
        title: "Tosse do Congelado",
        description:
          "A inalação constante do ar ácido sem proteção danificou seus pulmões. Em momentos de esforço físico, você pode ter uma crise de tosse, exigindo um teste de Constituição para não perder sua próxima ação.",
        effects: [],
      },
      {
        id: "metabolismo_lento",
        categoryId: "physical",
        title: "Metabolismo Lento",
        description:
          "Sua recuperação é deficiente. Leva o dobro do tempo para se recuperar de um estado de Energia inferior.",
        effects: [],
      },
      {
        id: "velho",
        categoryId: "physical",
        title: "Velho",
        description:
          "Uma idade avançada castiga o corpo mas afia a mente. -1 em todos os atributos físicos e +2 pontos no atributo Sabedoria.",
        effects: [
          {
            id: 0,
            target: "ATT_PHYSICAL",
            val: -1,
            mode: "FIXED",
            description: "Corpo Velho",
            link: "FLAW",
          },
          {
            id: 1,
            target: "wisdom",
            val: 2,
            mode: "FIXED",
            description: "Mente Afiada",
            link: "FLAW",
          },
        ],
      },
      {
        id: "amputado_braco",
        categoryId: "physical",
        title: "Amputado (Braço)",
        description:
          "Causado pelo frio, acidente ou destino perdeu um braço de forma parcial ou total. -1 em Destreza e Força ficando impedido de usar armas de duas mãos.",
        effects: [
          {
            id: 0,
            target: "dexterity",
            val: -1,
            mode: "FIXED",
            description: "Amputação (Braço)",
            link: "FLAW",
          },
          {
            id: 1,
            target: "strength",
            val: -1,
            mode: "FIXED",
            description: "Amputação (Braço)",
            link: "FLAW",
          },
        ],
      },
      {
        id: "amputado_perna",
        categoryId: "physical",
        title: "Amputado (Perna)",
        description:
          "Causado pelo frio, acidente ou destino perdeu uma perna de forma parcial ou total. Sofre -2 em Movimentação perdendo o valor mínimo de 1.",
        effects: [
          {
            id: 0,
            target: "MOVEMENT",
            val: -2,
            mode: "FIXED",
            description: "Amputação (Perna)",
            link: "FLAW",
          },
        ],
      },
      {
        id: "marca_identificacao",
        categoryId: "physical",
        title: "Marca de Identificação",
        description:
          "Possui algum tipo de marca, cicatriz ou tatuagem que facilita seu reconhecimento ou carrega algum estigma.",
        effects: [],
      },
      {
        id: "distrofia_muscular",
        categoryId: "physical",
        title: "Distrofia Muscular",
        description:
          "Você possui uma enfermidade que o impede de se desenvolver fisicamente como deveria. -3 em Força e treinamentos demoram o dobro do tempo.",
        effects: [
          {
            id: 0,
            target: "strength",
            val: -3,
            mode: "FIXED",
            description: "Distrofia Muscular",
            link: "FLAW",
          },
        ],
      },
      {
        id: "visao_deficiente",
        categoryId: "physical",
        title: "Visão Deficiente",
        description:
          "Você tem dificuldade em focar. Sofre uma penalidade de -3 em todos os testes de Procurar baseados em visão e em todos os testes de Armas de Fogo mirando alvos além do Alcance Curtíssimo.",
        effects: [
          {
            id: 0,
            target: "searching",
            val: -3,
            mode: "OPTIONAL",
            description: "Visão Deficiente",
            link: "FLAW",
          },
        ],
      },
      {
        id: "desatento",
        categoryId: "physical",
        title: "Desatento",
        description:
          "Você não percebe muitas coisas. Geralmente distraido com alguma situação, pensando em outra coisa ou somente vivendo a vida no automático. -3 em testes de Percepção.",
        effects: [
          {
            id: 0,
            target: "perception",
            val: -3,
            mode: "FIXED",
            description: "Desatento",
            link: "FLAW",
          },
        ],
      },
      {
        id: "tremores_incontrolaveis",
        categoryId: "physical",
        title: "Tremores Incontroláveis",
        description:
          "Sob estresse ou frio, recebe penalidade de -2 Destreza ou ações de precisão.",
        effects: [
          {
            id: 0,
            target: "dexterity",
            val: -2,
            mode: "OPTIONAL",
            description: "Tremores",
            link: "FLAW",
          },
        ],
      },
    ],
  },
  mental: {
    label: "PSICOLÓGICAS E MENTAIS",
    items: [
      {
        id: "curiosidade_morbida",
        categoryId: "mental",
        title: "Curiosidade Mórbida",
        description:
          "Você é incapaz de ignorar o inexplicável e o macabro, mesmo contra seu bom senso.",
        effects: [],
      },
      {
        id: "fobia",
        categoryId: "mental",
        title: "Fobia",
        description:
          "Você possui um medo irracional de algo. Ao ser confrontado com o objeto de sua fobia, deve ser bem-sucedido em um teste de Saúde Mental para não entrar em Pânico.",
        effects: [],
      },
      {
        id: "fe_quebrada",
        categoryId: "mental",
        title: "Fé Quebrada",
        description:
          "Você não possui âncoras espirituais ou ideológicas. Testes para recuperar Pontos de Loucura através de descanso ou interações positivas têm modificador de -2.",
        effects: [
          {
            id: 0,
            target: "mental_health",
            val: -2,
            mode: "OPTIONAL",
            description: "Fé Quebrada",
            link: "FLAW",
          },
        ],
      },
      {
        id: "psique_volatil",
        categoryId: "mental",
        title: "Psique Volátil",
        description:
          "Sua mente prioriza o caos. A ordem de alocação de pontos de capacidade de Saúde Mental é invertida [Insano -> Instável -> Estável].",
        effects: [],
      },
      {
        id: "pesadelos_vividos",
        categoryId: "mental",
        title: "Pesadelos Vívidos",
        description:
          "Seus sonhos são um tormento. Raramente acorda Descansado. Exige um teste de Saúde Mental toda manhã; falhar significa começar o dia Cansado ou Exausto.",
        effects: [],
      },
      {
        id: "colecionador_compulsivo",
        categoryId: "mental",
        title: "Colecionador Compulsivo",
        description:
          "Você possui uma vontade incontrolável de colecionar um determinado tipo de objeto.",
        effects: [],
      },
      {
        id: "credulidade",
        categoryId: "mental",
        title: "Credulidade",
        description:
          "Você acredita facilmente no que lhe dizem, seja a propaganda corporativa ou a mentira de um sobrevivente.",
        effects: [],
      },
      {
        id: "pacifista",
        categoryId: "mental",
        title: "Pacifista",
        description:
          "Você repudia participar da violência extrema. É incapaz de participar de combate para matar; homicídios culposos causam impacto gigantesco no personagem.",
        effects: [],
      },
      {
        id: "anti_armas",
        categoryId: "mental",
        title: "Anti-Armas",
        description:
          "Você é totalmente contra essas ferramentas mortíferas. Recebe penalidade de -3 em todos os testes ao portar qualquer arma de fogo.",
        effects: [
          {
            id: 0,
            target: "firearms_small",
            val: -3,
            mode: "OPTIONAL",
            description: "Anti-Armas",
            link: "FLAW",
          },
          {
            id: 1,
            target: "firearms_medium",
            val: -3,
            mode: "OPTIONAL",
            description: "Anti-Armas",
            link: "FLAW",
          },
        ],
      },
      {
        id: "ressonancia_cinzenta",
        categoryId: "mental",
        title: "Ressonância Cinzenta",
        description:
          "Sua mente é sensível à estranheza do ambiente. Resistir à Loucura derivada de origens ambientais tem modificador negativo de -2.",
        effects: [
          {
            id: 0,
            target: "mental_health",
            val: -2,
            mode: "OPTIONAL",
            description: "Ressonância Cinzenta",
            link: "FLAW",
          },
        ],
      },
      {
        id: "mania_explosiva",
        categoryId: "mental",
        title: "Mania Explosiva",
        description:
          "Você possui algum tipo de mania que geralmente consegue suprimir, mas aleatoriamente essa vontade surge e lhe escraviza até cumpri-la.",
        effects: [],
      },
      {
        id: "sanguinario",
        categoryId: "mental",
        title: "Sanguinário",
        description:
          "Você tem dificuldade em controlar sua violência. Não pode causar Dano Não Letal. Recusar-se a matar inimigo rendido causa até 6 Pontos de Loucura.",
        effects: [],
      },
      {
        id: "amnesia_seletiva",
        categoryId: "mental",
        title: "Amnésia Seletiva",
        description:
          "Lacunas em sua memória. Aleatoriamente realiza teste de Saúde Mental; se falhar, esquece o que aconteceu na última cena ou um fato específico.",
        effects: [],
      },
    ],
  },
  social: {
    label: "SOCIAIS",
    items: [
      {
        id: "marcado_pelo_frio",
        categoryId: "social",
        title: "Marcado pelo Frio",
        description:
          "Cicatrizes de geladura ou aparência doentia causa penalidade de -3 em Testes Sociais que dependem de boa aparência ou confiança.",
        effects: [
          {
            id: 0,
            target: "SKILL_SOCIAL",
            val: -3,
            mode: "OPTIONAL",
            description: "Marcado pelo Frio",
            link: "FLAW",
          },
        ],
      },
      {
        id: "inabilidade_social",
        categoryId: "social",
        title: "Inabilidade Social",
        description:
          "Você não entende nuances sociais. Testes Sociais têm penalidade fixa de -2.",
        effects: [
          {
            id: 0,
            target: "SKILL_SOCIAL",
            val: -2,
            mode: "FIXED",
            description: "Inabilidade Social",
            link: "FLAW",
          },
        ],
      },
      {
        id: "honra_inconveniente",
        categoryId: "social",
        title: "Honra Inconveniente",
        description:
          'Você segue um código moral inflexível (ex: "nunca atacar alguém pelas costas").',
        effects: [],
      },
      {
        id: "rosto_na_multidao",
        categoryId: "social",
        title: "Rosto na Multidão",
        description:
          "Você é esquecível. Útil para furtividade, mas um desastre para construir reputação ou alianças.",
        effects: [],
      },
      {
        id: "gagueira",
        categoryId: "social",
        title: "Gagueira",
        description:
          "Fala normal em situações calmas, mas sob estresse a voz falha. Penalidade de -3 em Testes Sociais baseados em fala e afeta comunicação em combate.",
        effects: [
          {
            id: 0,
            target: "SKILL_SOCIAL",
            val: -3,
            mode: "OPTIONAL",
            description: "Gagueira",
            link: "FLAW",
          },
        ],
      },
      {
        id: "ex_corp",
        categoryId: "social",
        title: "Ex-Corp",
        description:
          "A Elite o vê como inimigo e as ruas como ex-opressor. Sofre -2 em Testes Sociais contra os grupos citados, porém +2 contra os grupos restantes.",
        effects: [
          {
            id: 0,
            target: "SKILL_SOCIAL",
            val: -2,
            mode: "OPTIONAL",
            description: "Ex-Corp - NEGATIVO",
            link: "FLAW",
          },
          {
            id: 1,
            target: "SKILL_SOCIAL",
            val: 2,
            mode: "OPTIONAL",
            description: "Ex-Corp - POSITIVO",
            link: "FLAW",
          },
        ],
      },
      {
        id: "covarde",
        categoryId: "social",
        title: "Covarde",
        description:
          "Deve passar em teste de Autocontrole para não fugir ao entrar em combate em desvantagem. Sempre tem desvantagem de -2 em Iniciativa.",
        effects: [
          {
            id: 0,
            target: "agility",
            val: -2,
            mode: "OPTIONAL",
            description: "Covardia",
            link: "FLAW",
          },
        ],
      },
      {
        id: "voz_irritante",
        categoryId: "social",
        title: "Voz Irritante",
        description:
          "Sua voz não impõe respeito. Incapaz de fechar acordos ou negociar; sua presença pode desagradar.",
        effects: [],
      },
      {
        id: "honestidade_patologica",
        categoryId: "social",
        title: "Honestidade Patológica",
        description:
          "Psicologicamente incapaz de contar mentira direta. Pode tentar ser evasivo, mas não pode Mentir.",
        effects: [],
      },
      {
        id: "marcado_por_corporacao",
        categoryId: "social",
        title: "Marcado por Corporação",
        description:
          "Lista negra de uma Mega-Corporação. Falha automática em Linguagem dos Corps/Educação ao lidar com eles.",
        effects: [],
      },
    ],
  },
};
