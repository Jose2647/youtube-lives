
/**
 * (Arquivo: core.js)
 * Verifica apostas que atingiram a data de encerramento,
 * define vencedores/perdedores e gera pagamentos PIX (apenas para usuários logados).
 */

async function observarDOMParaBotoes() {
    adicionarBotoesApostasDesafios();
    const observer = new MutationObserver(adicionarBotoesApostasDesafios);
    observer.observe(document.body, { childList: true, subtree: true });
}
function adicionarBotoesApostasDesafios() {
    const videoInfos = document.querySelectorAll('.video-info');
    videoInfos.forEach(videoInfo => {
        const container = videoInfo.querySelector('.apostas-desafios-container') || document.createElement('div');
        container.className = 'apostas-desafios-container';
        
        const cardId = gerarCardId(videoInfo);
        const salaApostas = dados.apostasUsuarios.find(s => s.cardId === cardId);
        const salaDesafios = dados.desafiosUsuarios.find(s => s.cardId === cardId);

        // Botão de Apostas
        if (!videoInfo.querySelector('.botao-apostas-custom')) {
            const botaoApostas = document.createElement('button');
            botaoApostas.className = 'botao-apostas-custom';
            botaoApostas.setAttribute('aria-label', 'Abrir sala de apostas');
            botaoApostas.innerHTML = '💰 Apostas';
            if (salaApostas && salaApostas.apostas.length > 0) {
                botaoApostas.classList.add('with-red-dot');
            }
            botaoApostas.addEventListener('click', () => abrirModalApostas(videoInfo));
            container.appendChild(botaoApostas);
        }


        if (!videoInfo.contains(container)) {
            videoInfo.appendChild(container);
        }
    });
}
function atualizarIndicadoresApostas() {
    const botoesApostas = document.querySelectorAll('.botao-apostas-custom');
    
    botoesApostas.forEach(botao => {
        // Encontra o cardId associado a este botão
        const videoInfo = botao.closest('.video-info');
        if (!videoInfo) return;
        
        const cardId = gerarCardId(videoInfo);
        const apostaSala = dados.apostasUsuarios.find(s => s.cardId === cardId);
        
        // Remove classe anterior
        botao.classList.remove('with-red-dot');
        
        // Adiciona indicador se houver apostas ativas
        if (apostaSala && apostaSala.apostas.some(a => a.status === 'aberta')) {
            botao.classList.add('with-red-dot');
        }
    });
}





