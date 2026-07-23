# Regras do Projeto

Sempre rode o build (`npm run build`) após finalizar as alterações no código para garantir que não existam erros de compilação não detectados.

NUNCA faça cálculos sobre valores ou propriedades que já estão sendo exportados no `useCharacterStats.ts`. Sempre importe e utilize as variáveis já processadas (como maxEnergy, hpPorc, maxHp, actionPoints, reactions, movement, isOverweight, energyState, hpState, etc.)

# UI/UX Trigger Rule
Sempre que for solicitado criar, refatorar ou alterar componentes visuais (React, modais, telas, layouts, animações e CSS), você **deve** agir sob a persona da skill `design-director`, consultando o arquivo `SKILL.md` dessa skill (e suas respectivas referências) antes de escrever o código.

