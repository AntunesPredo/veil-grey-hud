import type { Disadvantage } from "../types/veil-grey";

export const SYSTEM_DISADVANTAGES: Record<
  string,
  { label: string; items: Disadvantage[] }
> = {
  physical: {
    label: "FÍSICO",
    items: [
      {
        id: "asma_severa",
        categoryId: "physical",
        title: "Asma Severa",
        description:
          "Seu sistema respiratório não lida bem com esforço contínuo. Falhar em testes de Atletismo consome 1 nível de Energia adicional.",
        effects: [
          {
            id: 0,
            target: "athletics",
            val: -1,
            mode: "FIXED",
            description: "Falta de Fôlego",
            link: "FLAW",
          },
        ],
      },
      {
        id: "metabolismo_acelerado",
        categoryId: "physical",
        title: "Metabolismo Defeituoso",
        description:
          "Você queima calorias rápido demais. Sua saciedade cai mais rápido que o normal.",
        effects: [
          {
            id: 0,
            target: "mass",
            val: -1,
            mode: "FIXED",
            description: "Metabolismo Acelerado",
            link: "FLAW",
          },
        ],
      },
    ],
  },
  mental: {
    label: "MENTAL",
    items: [
      {
        id: "ressonancia_cinzenta",
        categoryId: "mental",
        title: "Ressonância Cinzenta",
        description:
          "Sua mente é sensível à estranheza do ambiente. Resistir à Loucura derivada de origens ambientais tem modificador negativo.",
        effects: [
          {
            id: 0,
            target: "mental_health",
            val: -2,
            mode: "OPTIONAL",
            description: "Ressonância Cinzenta (Ambiental)",
            link: "FLAW",
          },
        ],
      },
      {
        id: "paranoia",
        categoryId: "mental",
        title: "Paranoia Aguda",
        description:
          "Você não confia em ninguém. Penalidade em interações sociais iniciais.",
        effects: [
          {
            id: 0,
            target: "charisma",
            val: -1,
            mode: "FIXED",
            description: "Paranoia",
            link: "FLAW",
          },
        ],
      },
    ],
  },
  social: {
    label: "SOCIAL",
    items: [
      {
        id: "procurado",
        categoryId: "social",
        title: "Procurado pelas Corps",
        description:
          "Seu rosto está nos bancos de dados corporativos. Testes de disfarce e infiltração em zonas ricas são mais difíceis.",
        effects: [
          {
            id: 0,
            target: "stealth",
            val: -2,
            mode: "OPTIONAL",
            description: "Rosto Conhecido (Zonas Corps)",
            link: "FLAW",
          },
        ],
      },
    ],
  },
};
