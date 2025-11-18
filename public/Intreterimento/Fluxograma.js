flowchart TD
    A[Início: Ação do Usuário no Frontend] --> B{Logado ou Guest?}

    B -->|Guest| C[Free Bet Apenas: Valor = 0\nPontos Fictícios Inicial 100 (LocalStorage)\nApostas Valem Pontos Fictícios, Sem Dinheiro Real\nNão Salva no Backend]

    B -->|Logado| D[Verificar Mérito/Conquista: Backend GET /user ou Local\nMérito Sempre Clamp 0-100 (via Schema/Hook)\nMáx Aposta em Reais: Baseado em Conquista (ex.: Latão: Baixo Limite, Diamante: Alto Limite)\nMin Aposta: ex. 0.50 Reais\nApostas Valem Pontos ou Dinheiro (PIX para Perdedores)]

    subgraph Criação de Aposta
        E[Abrir Formulário: abrirFormularioCriarAposta(cardId)] --> F[Preencher: Título, Valor (Baseado em Conquista para Reais), Opções (>=2), Data Encerramento (Futura)]
        F --> G[Confirmar: confirmarCriacaoAposta\nValidar Inputs/Limites por Conquista, Criar Aposta em Sala]
        G --> H[Backend Adaptado: POST /apostas (Adicionar Rota)\nSalvar em Aposta Model (cardId, apostas array com email criador)\nEnforce Mérito <=100 ao Salvar User (se aplicável)]
        H --> I[Sincronizar: syncDataToPeers (P2P) + salvarDados\nAtualizar Indicadores]
    end

    C --> E
    D --> E

    subgraph Participação em Aposta
        J[Abrir Formulário: abrirFormularioParticiparAposta(cardId, apostaId)] --> K[Verificar: Não Participou (por Email), Suficiente para Aposta (Limite por Conquista para Reais)]
        K --> L[Selecionar Opção: mostrarSelecaoOpcoesAposta]
        L --> M[Confirmar: confirmarParticipacaoAposta\nRegistrar Participante (email, opcao)\nDeduzir Pontos se Aposta em Pontos (Clamp 0-100)]
        M --> N[Backend Adaptado: POST /participar/aposta/:id (Adicionar Rota)\nAtualizar Aposta.participantes, User.merito se Pontos (Clamp via Schema)]
        N --> O[Sincronizar e Notificar]
    end

    subgraph Visualização
        P[Mostrar Apostas: mostrarApostasExistentes(cardId)] --> Q[Lista: Detalhes, Status, Botões Participar/PIX]
        Q --> R[Backend Adaptado: GET /apostas ou GET /aposta/:cardId\nFiltrar por Mérito/Conquista (como em GET /sala)]
    end

    subgraph Encerramento
        S[Verificar Automático: verificarEncerramentosAutomaticos()] --> T[Data Passada? Calcular Vencedores via opcaoVENCEDORA]
        T --> U[Se Aposta em Pontos: Atualizar Pontos/Mérito Vencedores/Perdedores (Clamp 0-100)\nSe Aposta em Dinheiro: Gera PIX Pendentes para Perdedores Logados (comprovantes em Desafio Schema)]
        U --> V[Backend Adaptado: PUT /encerrar/aposta/:id (Adicionar Rota)\nAtualizar Status, Notificacoes, User.merito se Pontos (Sempre <=100)]
        V --> W[Notificar: adicionarNotificacao, Diferente para Guests]
    end

    subgraph Pagamentos
        X[POST /pagamento (em pagamentoRouters.js)] --> Y[Se Perda e Paga em Dia (Atraso <=5min): Avançar Conquista (ex.: Latão -> Bronze)\nManter/Reset Mérito =100\nSe Atraso >5min: Debitar Mérito, Retroceder Conquista\nClamp via User Schema pre-save (Mérito <=100)]
    end

    I --> J
    O --> P
    R --> S
    W --> X
    Y --> Z[Fim: Atualizações Sincronizadas]

    style A fill:#f9f,stroke:#333
    style Z fill:#f9f,stroke:#333