export const VG_CONFIG = {
  rules: {
    attrMin: 0,
    attrMax: 10,
    skillMin: 0,
    skillMax: 5,
    evilnessMin: 0,
    evilnessMax: 10,
    baseHp: 65,
    hpPerCon: 0,
    baseLoad: 10,
    baseInsanity: 3,
    baseSustenance: 4,
    thresholdInjured: 50,
    thresholdCrit: 25,
    movementMin: 1,
    collapseBaseDC: 13,
    collapseFailPenalty: 2,
    deathBaseDC: 13,
    deathFailPenalty: 2,
  },
  progression: {
    xpMultiplier: 100, // current level * 100
    tiers: [
      { maxLevel: 3, maxAttr: 5, maxSkill: 3 },
      { maxLevel: 7, maxAttr: 7, maxSkill: 5 },
      { maxLevel: 10, maxAttr: 10, maxSkill: 5 },
    ],
    rewardsPerLevel: {
      1: { attr: 1, skill: 2, spec: 0 },
      3: { attr: 1, skill: 2, spec: 1 },
      // To be expanded as needed
    },
  },
  roles: {
    // Scaffold for future Pre-Started initialization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as Record<string, any>,
  labels: {
    evilness: "MALDADE",
    evilnessLabel: "(0-10)",
    btnRoll: "ROLL",
  },
  att_groups: {
    physical: {
      label: "FÍSICOS",
      rollCategory: "ATT_PHYSICAL",
      atributes: {
        strength: {
          id: "strength",
          label: "FORÇA",
          short: "FOR",
        },
        constitution: {
          id: "constitution",
          label: "CONSTITUIÇÃO",
          short: "CON",
        },
        dexterity: {
          id: "dexterity",
          label: "DESTREZA",
          short: "DES",
        },
      },
    },
    mental: {
      label: "MENTAIS",
      rollCategory: "ATT_MENTAL",
      atributes: {
        wisdom: {
          id: "wisdom",
          label: "SABEDORIA",
          short: "SAB",
        },
        intelligence: {
          id: "intelligence",
          label: "INTELIGÊNCIA",
          short: "INT",
        },
        instinct: {
          id: "instinct",
          label: "INSTINTO",
          short: "INS",
        },
      },
    },
    social: {
      label: "SOCIAIS",
      rollCategory: "ATT_SOCIAL",
      atributes: {
        charisma: {
          id: "charisma",
          label: "CARISMA",
          short: "CAR",
        },
        manipulation: {
          id: "manipulation",
          label: "MANIPULAÇÃO",
          short: "MAN",
        },
      },
    },
  },
  att_secondary: {
    agility: {
      id: "sec_agility",
      label: "AGILIDADE",
      rollCategory: "ATT_PHYSICAL",
    },
    mass: {
      id: "sec_mass",
      label: "MASSA CORPÓREA",
      rollCategory: "ATT_PHYSICAL",
    },
    perception: {
      id: "sec_perception",
      label: "PERCEPÇÃO",
      rollCategory: "ATT_MENTAL",
    },
    mental_health: {
      id: "sec_mental_healt",
      label: "SAÚDE MENTAL",
      rollCategory: "ATT_MENTAL",
    },
  },
  skill_groups: {
    physical: {
      label: "FÍSICO",
      rollCategory: "SKILL_PHYSICAL",
      skills: {
        athletics: {
          id: "athletics",
          label: "ATLETISMO",
          bases: ["strength", "constitution"],
        },
        exotic_weapons: {
          id: "exotic_weapons",
          label: "ARMAS EXÓTICAS",
          bases: ["dexterity", "strength"],
        },
        firearms_small: {
          id: "firearms_small",
          label: "ARMAS DE FOGO (CURTO ALCANCE)",
          bases: ["dexterity", "instinct"],
        },
        firearms_medium: {
          id: "firearms_medium",
          label: "ARMAS DE FOGO (MÉDIO ALCANCE)",
          bases: ["dexterity"],
        },
        lockpick: {
          id: "lockpick",
          label: "ARROMBAMENTO",
          bases: ["dexterity", "instinct"],
        },
        throwing: {
          id: "throwing",
          label: "ARREMESSO",
          bases: ["strength", "dexterity"],
        },
        street_fighting: {
          id: "street_fighting",
          label: "BRIGA DE RUA",
          bases: ["strength"],
        },
        blunt_short: {
          id: "blunt_short",
          label: "ARMAS DE IMPACTO (CURTAS)",
          bases: ["strength"],
        },
        blunt_medium: {
          id: "blunt_medium",
          label: "ARMAS DE IMPACTO (MÉDIAS)",
          bases: ["strength", "dexterity"],
        },
        blades_short: {
          id: "blades_short",
          label: "LÂMINAS (CURTAS)",
          bases: ["dexterity"],
        },
        blades_medium: {
          id: "blades_medium",
          label: "LÂMINAS (MÉDIAS)",
          bases: ["strength", "dexterity"],
        },
        light_hands: {
          id: "light_hands",
          label: "MÃOS LEVES",
          bases: ["dexterity"],
        },
        maneuvers: {
          id: "maneuvers",
          label: "MANOBRAS",
          bases: ["dexterity", "strength"],
        },
        immune_resistance: {
          id: "immune_resistance",
          label: "RESISTÊNCIA IMUNE",
          bases: ["constitution"],
        },
        natural_resistance: {
          id: "natural_resistance",
          label: "RESISTÊNCIA NATURAL",
          bases: ["constitution"],
        },
        tolerance: {
          id: "tolerance",
          label: "TOLERÂNCIA",
          bases: ["constitution", "instinct"],
        },
      },
    },
    mental: {
      label: "MENTAL",
      rollCategory: "SKILL_MENTAL",
      skills: {
        traps: {
          id: "traps",
          label: "ARMADILHAS",
          bases: ["instinct", "intelligence"],
        },
        gunsmithing: {
          id: "gunsmithing",
          label: "ARMEIRO",
          bases: ["intelligence", "dexterity"],
        },
        arts: {
          id: "arts",
          label: "ARTES",
          bases: ["intelligence", "instinct"],
        },
        self_control: {
          id: "self_control",
          label: "AUTOCONTROLE",
          bases: ["wisdom", "instinct"],
        },
        camouflage: {
          id: "camouflage",
          label: "CAMUFLAGEM",
          bases: ["intelligence", "wisdom"],
        },
        concentration: {
          id: "concentration",
          label: "CONCENTRAÇÃO",
          bases: ["wisdom", "constitution"],
        },
        cooking: {
          id: "cooking",
          label: "CULINÁRIA",
          bases: ["wisdom"],
        },
        electronics: {
          id: "electronics",
          label: "ELETRÔNICA",
          bases: ["intelligence", "dexterity"],
        },
        encyclopedia: {
          id: "encyclopedia",
          label: "ENCICLOPÉDIA",
          bases: ["intelligence"],
        },
        engineering: {
          id: "engineering",
          label: "ENGENHARIA",
          bases: ["intelligence", "wisdom"],
        },
        explosives: {
          id: "explosives",
          label: "EXPLOSIVOS",
          bases: ["intelligence", "dexterity"],
        },
        falsification: {
          id: "falsification",
          label: "FALSIFICAÇÃO",
          bases: ["intelligence", "manipulation"],
        },
        stealth: {
          id: "stealth",
          label: "FURTIVIDADE",
          bases: ["dexterity", "instinct"],
        },
        hacking: {
          id: "hacking",
          label: "HACKING",
          bases: ["intelligence"],
        },
        instruments: {
          id: "instruments",
          label: "INSTRUMENTOS MUSICAIS",
          bases: ["dexterity", "wisdom"],
        },
        investigation: {
          id: "investigation",
          label: "INVESTIGAÇÃO",
          bases: ["intelligence", "wisdom"],
        },
        mechanics: {
          id: "mechanics",
          label: "MECÂNICA",
          bases: ["intelligence", "strength"],
        },
        medicine: {
          id: "medicine",
          label: "MEDICINA",
          bases: ["intelligence", "wisdom"],
        },
        navigation: {
          id: "navigation",
          label: "NAVEGAÇÃO",
          bases: ["wisdom", "instinct"],
        },
        crafts: {
          id: "crafts",
          label: "OFÍCIOS",
          bases: ["dexterity", "intelligence"],
        },
        first_aid: {
          id: "first_aid",
          label: "PRIMEIROS SOCORROS",
          bases: ["wisdom", "instinct"],
        },
        searching: {
          id: "searching",
          label: "PROCURA",
          bases: ["intelligence", "instinct"],
        },
        chemistry: {
          id: "chemistry",
          label: "QUÍMICA",
          bases: ["intelligence", "wisdom"],
        },
        tracking: {
          id: "tracking",
          label: "RASTREIO",
          bases: ["instinct", "wisdom"],
        },
        survival: {
          id: "survival",
          label: "SOBREVIVÊNCIA",
          bases: ["wisdom", "constitution"],
        },
        vehicles: {
          id: "vehicles",
          label: "VEÍCULOS",
          bases: ["wisdom", "instinct"],
        },
        exotic_machines: {
          id: "exotic_machines",
          label: "MÁQUINAS EXÓTICAS",
          bases: ["intelligence", "instinct"],
        },
      },
    },
    social: {
      label: "SOCIAL",
      rollCategory: "SKILL_SOCIAL",
      skills: {
        contacts: {
          id: "contacts",
          label: "CONTATOS",
          bases: ["charisma"],
        },
        persuasion: {
          id: "persuasion",
          label: "CNOVENCIMENTO",
          bases: ["wisdom", "manipulation"],
        },
        popular_culture: {
          id: "popular_culture",
          label: "CULTURA POPULAR",
          bases: ["intelligence", "charisma"],
        },
        politics: {
          id: "politics",
          label: "POLÍTICA",
          bases: ["charisma"],
        },
        distraction: {
          id: "distraction",
          label: "DISTRAÇÃO",
          bases: ["intelligence", "manipulation"],
        },
        education: {
          id: "education",
          label: "EDUCAÇÃO",
          bases: ["intelligence", "charisma"],
        },
        animal_empathy: {
          id: "animal_empathy",
          label: "EMPATIA COM ANIMAIS",
          bases: ["instinct", "charisma"],
        },
        intimidation: {
          id: "intimidation",
          label: "INTIMIDAÇÃO",
          bases: ["manipulation"],
        },
        gambling: {
          id: "gambling",
          label: "JOGATINA",
          bases: ["manipulation", "intelligence"],
        },
        corp_language: {
          id: "corp_language",
          label: "LINGUAGEM DOS CORPS",
          bases: ["wisdom", "manipulation"],
        },
        lying: {
          id: "lying",
          label: "MENTIRA",
          bases: ["manipulation", "intelligence"],
        },
        cold_reading: {
          id: "cold_reading",
          label: "LEITURA FRIA",
          bases: ["wisdom", "instinct"],
        },
        seduction: {
          id: "seduction",
          label: "SEDUÇÃO",
          bases: ["charisma", "manipulation"],
        },
      },
    },
  },
} as const;
