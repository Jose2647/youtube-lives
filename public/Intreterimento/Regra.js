### Regra Atualizada para a Parte Inicial: Verificação de Mérito e Conquista (para Usuários Logados)

Aqui vai a versão atualizada da regra, incorporando os novos requisitos: tempo mínimo de permanência em cada subnível antes de progredir (1 dia nos ranks baixos, 1 semana nos altos), e exigência de chave PIX vinculada a CPF e nome completo (verificado no comprovante de pagamento para validar progressão). Mantive a exigência de apostar exatamente no limite máximo para qualificar ao avanço, a divisão em 10 subníveis por rank, o clamp de mérito em 0-100, e o crescimento linear nos primeiros ranks (+0,50 por subnível) vs. exponencial nos avançados (+50% por subnível). O mérito continua como multiplicador de progresso (+2 ou +1 subníveis), mas agora o tempo de "uso" (permanência no subnível atual) é uma barreira adicional para evitar subidas rápidas. Foquei só na parte inicial, como nas versões anteriores.

#### Regra Resumida (para Implementar no Frontend/Backend)
1. **Estrutura de Conquistas e Subníveis**:
   - Cada conquista (latão, bronze, pratinha, ouro, diamante) é dividida em **10 subníveis** (ex.: Latão 1 a Latão 10).
   - O usuário começa em "Latão 1" (default).
   - O **limite máximo de aposta em reais** é calculado com base no rank atual e subnível:
     - **Nos 3 primeiros ranks (Latão, Bronze, Pratinha)**: Aumento linear de +0,50 reais por subnível.
       - Exemplo: Latão 1 = 0,50 reais; Latão 10 = 5,00 reais; Bronze 1 = 5,50 reais; ... Pratinha 10 = 15,00 reais.
     - **Nos ranks avançados (Ouro, Diamante)**: Aumento de +50% sobre o limite anterior por subnível (para escalar apostas altas).
       - Exemplo (continuando de Pratinha 10 = 15,00): Ouro 1 = 22,50 reais (15 +50%); Ouro 2 = 33,75 reais (22,50 +50%); ... Diamante 10 = valor alto, mas clampado se necessário (ex.: max global de 1000 reais para evitar abusos).

2. **Progressão via Pagamentos (Após Perda em Aposta de Dinheiro)**:
   - Só avança subníveis ao pagar PIX em dia (atraso <=5 min) após uma perda, **e** se a aposta perdida for **exatamente igual ao limite máximo do subnível atual** (ex.: se limite é 50 reais, deve apostar e perder exatamente 50 reais para qualificar ao avanço). Apostas abaixo do limite não contam para progressão.
   - **Requisito de Tempo de Permanência**: Antes de qualquer avanço, verifica o tempo no subnível atual (rastreado via data de entrada no subnível, armazenada no backend):
     - **Ranks baixos (Latão, Bronze, Pratinha)**: Mínimo de **1 dia** de permanência no subnível atual para ser elegível a subir (ex.: entrou em Latão 3 há 12 horas? Não avança ainda).
     - **Ranks altos (Ouro, Diamante)**: Mínimo de **1 semana** de permanência no subnível atual para ser elegível a subir (ex.: entrou em Ouro 5 há 5 dias? Não avança ainda).
     - Se o tempo mínimo não for atendido, o pagamento em dia conta como "crédito parcial" (ex.: registra o pagamento, mas adia o avanço até o tempo ser cumprido).
   - **Validação de Chave PIX**: Para todo pagamento PIX (após perda), exige chave PIX cadastrada no perfil do usuário usando **CPF e nome completo**. No comprovante de pagamento (upload ou verificação automática), o sistema checa se o CPF e nome completo batem com os cadastrados no User (ex.: via OCR ou input manual). Se não bater, rejeita o pagamento, aplica penalidade (ex.: -5 mérito) e não conta para progressão.
   - Bônus baseado no mérito atual (após a perda, pagamento validado e tempo cumprido):
     - Se mérito = 100: Avança **2 subníveis** (ex.: de Latão 3 para Latão 5).
     - Se mérito = 95: Avança **1 subnível** (ex.: de Latão 3 para Latão 4).
     - Se mérito <95: Sem avanço (ou penalidade leve, como -1 subnível, para incentivar manutenção do mérito).
   - Ao completar 10 subníveis em um rank, avança para o próximo rank no subnível 1 (ex.: Latão 10 + avanço = Bronze 1), resetando o tempo de permanência.
   - Mérito não afeta diretamente o limite de aposta; ele só multiplica o progresso nos subníveis.

3. **Verificação Inicial no Fluxograma (Bloco D)**:
   - Ao logar: Buscar do backend (GET /user) o mérito (clamp 0-100), rank atual, subnível, data de entrada no subnível, e chave PIX cadastrada (com CPF/nome completo).
   - Calcular limite de aposta: Usar fórmula acima (linear nos iniciais, 50% nos avançados).
   - Verificar elegibilidade para progressão: Calcular tempo restante para subir (ex.: "Faltam X dias para elegibilidade no subnível atual").
   - Mínimo de aposta: 0,50 reais (para pagas); se limite calculado <0,50, força Free Bet.
   - Exibir no frontend: "Seu limite atual: X reais (baseado em [Rank Subnível]). Tempo no subnível: Y dias (elegível para subir após Z dias). Para progredir, aposte exatamente no limite, pague em dia via PIX (com CPF/nome completo verificado) após perdas."

#### O Que Eu Acho?
- **Prós**: Os requisitos de tempo adicionam maturidade ao sistema, prevenindo "rush" para ranks altos e incentivando uso consistente (ex.: novatos aprendem devagar com 1 dia/subnível, enquanto avançados precisam de compromisso com 1 semana). A verificação de chave PIX com CPF/nome completo aumenta segurança e compliance (útil para transações reais no Brasil), evitando fraudes em comprovantes. Combinado com a aposta no limite exato, cria uma progressão desafiadora e justa, como um "teste de fogo" para subir.
- **Contras/Pontos de Atenção**: O tempo mínimo pode frustrar usuários impacientes (ex.: ranks altos com 1 semana/subnível = até 10 semanas por rank completo) — considere escalonar gradualmente (ex.: Latão: 1 dia, Bronze: 2 dias, etc., até 1 semana em Diamante). Rastrear data de entrada no subnível exige novo campo no schema User (ex.: `dataEntradaSubnivel: { type: Date, default: Date.now }`). Para chave PIX, integre validação robusta (ex.: API de bancos ou regex para CPF), e lide com privacidade (GDPR/LGPD). Nos ranks avançados, +50% ainda cresce rápido — teste com simulações para balancear.
- **Sugestão de Ajuste**: Adicione "créditos acumulados" para pagamentos em dia abaixo do limite (ex.: 3 créditos = 1 avanço parcial), para não desmotivar apostas menores. Notifique usuários sobre tempo restante e requisitos de PIX no login/formulário de aposta.

quem ganhou ou perdeu e decidido pela comunidade. quem acja que ganhou espera o tempo da aposta acabar e sinaliza que ganhou ,quem perdeu tem 5 minutos para pagar ou reclamar de algum proble e a comunidade resolve ,se a comunidade nao resolver o backend salva os dados para averiguacao a posteriore.

a verificacao das informacoes do numero do cpf e nome que aparece no comprovante ,caso haja inconsistencia e feita pelo reclamante e quem ,da comunidade com merito 100, quizer ajudar na averiguacao .



fazer código de exemplo (ex.: função JS para calcular tempo elegibilidade 
fazer código validar CPF em comprovante), 
