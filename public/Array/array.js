function paraCadaCHAVEDOobjeto(chave, objeto, callback) {
    // Garante que a chave existe e é iterável
    if (!objeto || !objeto[chave] || !Array.isArray(objeto[chave])) {
        console.warn(`⚠️ A chave "${chave}" não é um array válido em:`, objeto);
        return;
    }

    for (const item of objeto[chave]) {
        callback(item);
    }
}
/// exemplo de uso
function carregarEstadiosDoJogo(jogoId) {
    const container = document.getElementById('lista-estadios');
    container.innerHTML = '';

    const jogo = dados.jogos.find(j => j.id === jogoId);
    if (!jogo) {
        alert("Jogo não encontrado!");
        return;
    }

    document.querySelector('#secao-estadios h2').textContent = `Estádios - ${jogo.nome}`;

    // === BOTÕES TOPO ===
    const topo = document.createElement('div');
    topo.innerHTML = `
        <div style="
            text-align: center; 
            margin: 15px 0; 
            padding: 10px; 
            background: #f8f9fa; 
            border-radius: 8px; 
            display: flex; 
            justify-content: center; 
            gap: 10px; 
            flex-wrap: wrap;
        ">
            <button onclick="adicionarEstadio()" style="
                background:#28a745; 
                color:white; 
                padding:8px 12px; 
                border:none; 
                border-radius:5px; 
                font-size:0.9em;
            ">
                + Criar novo estádio
            </button>
            <button onclick="colarEstadioCopiado()" style="
                background:#6f42c1; 
                color:white; 
                padding:8px 12px; 
                border:none; 
                border-radius:5px; 
                font-size:0.9em;
            ">
                Colar estádio
            </button>
        </div>
    `;
    // container.appendChild(topo);

    // === LISTAR ESTÁDIOS USANDO A FUNÇÃO GENÉRICA ===
    paraCadaCHAVEDOobjeto("estadios", jogo, (estadio) => {
        const el = document.createElement('div');
        el.innerHTML = gerarHTMLCardEstadio(jogo, estadio);
        container.appendChild(el);
    });
}
