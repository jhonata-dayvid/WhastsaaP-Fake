document.addEventListener('DOMContentLoaded', function() {
    const mensagemInput = document.getElementById('mensagem');
    const sendBtn = document.getElementById('sendBtn');
    const chatArea = document.getElementById('chatArea');

    // Função para obter horário atual
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Função para adicionar mensagem ao chat
    function addMessage(text, isUser = false) {
        console.log('=== ADICIONANDO MENSAGEM ===');
        console.log('Texto:', text);
        console.log('É usuário:', isUser);
        
        const messageDiv = document.createElement('div');
        messageDiv.style.marginBottom = '8px';
        messageDiv.style.display = 'flex';
        messageDiv.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
        
        const bubble = document.createElement('div');
        bubble.style.backgroundColor = isUser ? '#005c4b' : '#262d31';
        bubble.style.color = 'white';
        bubble.style.padding = '12px';
        bubble.style.borderRadius = '8px';
        bubble.style.maxWidth = '70%';
        bubble.style.wordWrap = 'break-word';
        
        const textP = document.createElement('p');
        textP.style.margin = '0';
        textP.style.fontSize = '14px';
        textP.textContent = text;
        
        const timeSpan = document.createElement('span');
        timeSpan.style.fontSize = '11px';
        timeSpan.style.color = isUser ? '#d1f4cc' : '#8696a0';
        timeSpan.style.display = 'block';
        timeSpan.style.textAlign = 'right';
        timeSpan.style.marginTop = '4px';
        timeSpan.textContent = getCurrentTime();
        
        bubble.appendChild(textP);
        bubble.appendChild(timeSpan);
        messageDiv.appendChild(bubble);
        chatArea.appendChild(messageDiv);
        
        chatArea.scrollTop = chatArea.scrollHeight;
        
        console.log('Mensagem adicionada ao DOM');
    }

    // Função para enviar mensagem
    async function enviarMensagem() {
        const mensagem = mensagemInput.value.trim();
        
        console.log('=== ENVIANDO MENSAGEM ===');
        console.log('Mensagem:', mensagem);
        
        if (!mensagem) return;
        
        // Adicionar mensagem do usuário
        addMessage(mensagem, true);
        mensagemInput.value = '';
        
        try {
            console.log('Fazendo requisição...');
            
            const response = await fetch('/enviar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mensagem: mensagem })
            });
            
            console.log('Resposta recebida, status:', response.status);
            
            const data = await response.json();
            console.log('Dados JSON:', data);
            console.log('Campo resposta:', data.resposta);
            
            // Adicionar resposta do bot
            addMessage(data.resposta, false);
            
        } catch (error) {
            console.error('ERRO:', error);
            addMessage('Erro ao conectar', false);
        }
    }

    // Event listeners
    sendBtn.addEventListener('click', enviarMensagem);
    
    mensagemInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            enviarMensagem();
        }
    });

    // Mensagem inicial
    addMessage('Olá! Digite ajuda parar verificar opções disponíveis ', false);
    mensagemInput.focus();
    
    console.log('Script inicializado com sucesso');
});
