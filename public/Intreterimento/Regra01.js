### Regra para a Parte Inicial: Verificação de Mérito e Conquista (para Usuários Logados)

 1. dividir as conquistas em subníveis para dar uma progressão mais granular e motivadora, como um sistema de "tiers" dentro de cada rank.
  Isso incentiva pagamentos em dia e mantém o mérito como um "multiplicador" de progresso. 
  2.progressão linear nos primeiros ranks para iniciantes, e exponencial nos avançados para high-stakes

- Mérito sempre clampado em 0-100 (como no backend).
- Limite de apostas em reais calculado por subnível (inicial de 0,50 reais, crescendo).
- Progressão: Pagamentos em dia (após perda) avançam subníveis, com bônus por mérito alto. "após os 3 primeiros níveis"  ranks iniciais (latão, bronze, pratinha), e crescimento de 50% nos ranks avançados (ouro, diamante) para escalar os limites sem explodir valores.

#### Regra Resumida (para Implementar no Frontend/Backend)
1. **Estrutura de Conquistas e Subníveis**:
   - Cada conquista (latão, bronze, platina, ouro, diamante) é dividida em **10 subníveis** (ex.: Latão 1 a Latão 10).
   - O usuário começa em "Latão 1" (default).
   - O **limite máximo de aposta em reais** é calculado com base no rank atual e subnível:
     - **Nos 3 primeiros ranks (Latão, Bronze, Pratinha)**: Aumento linear de +0,50 reais por subnível.
       - Exemplo: Latão 1 = 0,50 reais; Latão 10 = 5,00 reais; Bronze 1 = 5,50 reais; ... Platina 10 = 15,00 reais.
     - **Nos ranks avançados (Ouro, Diamante)**: Aumento de +50% sobre o limite anterior por subnível (para escalar apostas altas).
       - Exemplo (continuando de Pratinha 10 = 15,00): Ouro 1 = 22,50 reais (15 +50%); Ouro 2 = 33,75 reais (22,50 +50%); ... Diamante 10 = valor alto, mas clampado se necessário (ex.: max global de 1000 reais para evitar abusos).

2. **Progressão via Pagamentos (Após Perda em Aposta de Dinheiro)**:
   - Só avança subníveis ao pagar PIX em dia (atraso <=5 min) após uma perda.
   - Bônus baseado no mérito atual:
     - Se mérito = 100: Avança **2 subníveis** (ex.: de Latão 3 para Latão 5).
     - Se mérito = 95: Avança **1 subnível** (ex.: de Latão 3 para Latão 4).
     - Se mérito <95: Sem avanço (ou penalidade leve, como -1 subnível, para incentivar manutenção do mérito).
   - Ao completar 10 subníveis em um rank, avança para o próximo rank no subnível 1 (ex.: Latão 10 + avanço = Bronze 1).
   - Mérito não afeta diretamente o limite de aposta; ele só multiplica o progresso nos subníveis.

3. **Verificação Inicial no Fluxograma (Bloco D)**:
   - Ao logar: Buscar do backend (GET /user) o mérito (clamp 0-100), rank atual e subnível.
   - Calcular limite de aposta: Usar fórmula acima (linear nos iniciais, 50% nos avançados).
   - Mínimo de aposta: 0,50 reais (para pagas); se limite calculado <0,50, força Free Bet.
   - Exibir no frontend: "Seu limite atual: X reais (baseado em [Rank Subnível])".

#### O Que Eu Acho?
- **Prós**: Essa estrutura é gamificada e justa — iniciais acessíveis (crescimento lento para evitar perdas grandes em novatos), mas avança rápido com pagamentos consistentes. O bônus por mérito 100/95 motiva manter o mérito alto sem torná-lo a "moeda" principal.
- **Contras/Pontos de Atenção**: Pode ficar complexo rastrear subníveis no backend (adicione um campo no User schema: `subnivel: { type: Number, default: 1, min: 1, max: 10 }`). Teste os cálculos para não explodir limites (ex.: adicione um cap global de 1000 reais). Nos ranks avançados, +50% por subnível cresce exponencialmente (Ouro 10 poderia chegar a ~191 reais, Diamante 10 a milhares — ajuste o % se quiser mais controle).
- **Sugestão de Ajuste**: Defina limites base por rank para evitar dependência sequencial (ex.: Latão: 0,50-5,00; Bronze: 5,50-10,50; etc.), e integre notificações para "Subiu de subnível!".

Se quiser código de exemplo (ex.: função JS para calcular limite) ou ajustes nessa regra, me diz! O resto do fluxograma fica pra depois, como pediu.