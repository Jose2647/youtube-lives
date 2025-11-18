

function calcularTempoRestante(dataFim) {
    const agora = new Date();
    const fim = new Date(dataFim);
    const diff = fim - agora;
    
    if (diff <= 0) return 'Encerrado';
    
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
        return `${horas}h ${minutos}m`;
    } else {
        return `${minutos}m`;
    }
}
async function participarEvento(eventoId) {
    const evento = eventos.find(e => e.id === eventoId);
    if (!evento) return;
    
     adicionarNotificacao(
        '🎉 Inscrição Confirmada!',
        `Você está participando do evento: ${evento.titulo}`,
        'sucesso'
    );
    
    // Aqui você pode adicionar lógica específica para cada tipo de evento
    if (evento.titulo.includes('Torneio') && adicionarNotificacao) {
        // Lógica para torneios
        setTimeout(() => {
            adicionarNotificacao(
                '⚔️ Torneio Iniciado!',
                'O torneio começou! Boa sorte!',
                'alerta'
            );
        }, 2000);
    }
}

