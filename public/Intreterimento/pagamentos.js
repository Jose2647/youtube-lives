/*
criarPagamentosPendentes(), sendComprovanteAposta(), contestarPagamentoPendentes() (se adicionar), notificarPerdedores(), notificarVencedores().

*/


async function sendComprovanteAposta(apostaId, minutosAtrasoDefault) {
    const fileInput = document.getElementById(`comprovanteInput-${apostaId}`);
    const file = fileInput.files[0];
    if (!file) return alert('Selecione um comprovante!');
    
    // Calcula atraso real (ex.: diferença desde dataEncerramento)
    const aposta = dados.apostasUsuarios.flatMap(s => s.apostas).find(a => a.id === apostaId);
    const atraso = aposta ? Math.floor((Date.now() - new Date(aposta.dataEncerramento).getTime()) / (1000 * 60)) : minutosAtrasoDefault;
    
    const metadata = { 
        email: window.usuarioLogado.email, 
        minutosAtraso: atraso,
        apostaId: apostaId  // Extra para contexto
    };
    
    try {
        await sendComprovante(file, metadata);  // Chama a função do pagamentoFrontend.js (ajuste para passar file e metadata)
        adicionarNotificacao('✅ Comprovante Enviado', 'Seu pagamento PIX foi registrado!', 'sucesso');
        // Atualiza status pendente
        const pendente = aposta.pagamentosPendentes.find(p => p.email === window.usuarioLogado.email);
        if (pendente) pendente.status = 'enviado';
        salvarDados();
    } catch (err) {
        adicionarNotificacao('❌ Erro', 'Falha ao enviar comprovante: ' + err, 'erro');
    }
}