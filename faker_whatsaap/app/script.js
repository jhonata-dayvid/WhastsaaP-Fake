document.addEventListener('DOMContentLoaded', function() {
    const mensagemInput = document.getElementById('mensagem');
    const sendBtn = document.getElementById('sendBtn');
    const chatArea = document.getElementById('chatArea');
    const attachmentBtn = document.getElementById('attachmentBtn');
    const fileInput = document.getElementById('fileInput');

    // Função para obter horário atual
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Função para criar preview de imagem
    function createImagePreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    // Função para adicionar mensagem ao chat (modificada para suportar imagens)
    function addMessage(text, isUser = false, imageData = null) {
        console.log('=== ADICIONANDO MENSAGEM ===');
        console.log('Texto:', text);
        console.log('É usuário:', isUser);
        console.log('Tem imagem:', !!imageData);
        
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
        
        // Se há uma imagem, adicionar ela primeiro
        if (imageData) {
            const img = document.createElement('img');
            img.src = imageData;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.marginBottom = text ? '8px' : '0';
            img.style.cursor = 'pointer';
            
            // Adicionar funcionalidade de clique para expandir imagem
            img.addEventListener('click', () => {
                openImageModal(imageData);
            });
            
            bubble.appendChild(img);
        }
        
        // Adicionar texto se existir
        if (text) {
            const textP = document.createElement('p');
            textP.style.margin = '0';
            textP.style.fontSize = '14px';
            textP.textContent = text;
            bubble.appendChild(textP);
        }
        
        const timeSpan = document.createElement('span');
        timeSpan.style.fontSize = '11px';
        timeSpan.style.color = isUser ? '#d1f4cc' : '#8696a0';
        timeSpan.style.display = 'block';
        timeSpan.style.textAlign = 'right';
        timeSpan.style.marginTop = '4px';
        timeSpan.textContent = getCurrentTime();
        
        bubble.appendChild(timeSpan);
        messageDiv.appendChild(bubble);
        chatArea.appendChild(messageDiv);
        
        chatArea.scrollTop = chatArea.scrollHeight;
        
        console.log('Mensagem adicionada ao DOM');
    }

    // Função para abrir modal de imagem
    function openImageModal(imageSrc) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        modal.style.cursor = 'pointer';
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.borderRadius = '8px';
        
        modal.appendChild(img);
        document.body.appendChild(modal);
        
        // Fechar modal ao clicar
        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Função para processar arquivo selecionado
    async function processSelectedFile(file) {
        if (!file) return;
        
        // Verificar se é uma imagem
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }
        
        // Verificar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            return;
        }
        
        try {
            const imageData = await createImagePreview(file);
            
            // Adicionar mensagem com imagem
            addMessage('', true, imageData);
            
            // Enviar para o servidor
            await enviarImagem(file);
            
        } catch (error) {
            console.error('Erro ao processar imagem:', error);
            alert('Erro ao processar a imagem.');
        }
    }

    // Função para enviar imagem para o servidor
    async function enviarImagem(file) {
        try {
            const formData = new FormData();
            formData.append('imagem', file);
            
            const response = await fetch('/enviar-imagem', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.resposta) {
                    addMessage(data.resposta, false);
                }
            } else {
                addMessage('Erro ao enviar imagem', false);
            }
            
        } catch (error) {
            console.error('Erro ao enviar imagem:', error);
            addMessage('Erro ao conectar com o servidor', false);
        }
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

    // Event listener para botão de anexar
    if (attachmentBtn) {
        attachmentBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // Event listener para seleção de arquivo
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            processSelectedFile(file);
            // Limpar o input para permitir selecionar o mesmo arquivo novamente
            e.target.value = '';
        });
    }

    // Suporte para drag and drop
    chatArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        chatArea.style.backgroundColor = '#1a1a1a';
    });

    chatArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        chatArea.style.backgroundColor = '';
    });

    chatArea.addEventListener('drop', (e) => {
        e.preventDefault();
        chatArea.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processSelectedFile(files[0]);
        }
    });

    // Mensagem inicial
    addMessage('Olá! Digite ajuda para verificar opções disponíveis', false);
    mensagemInput.focus();
    
    console.log('Script inicializado com sucesso');
});
