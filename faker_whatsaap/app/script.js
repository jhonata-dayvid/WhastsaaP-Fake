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

    // Função para obter ícone do arquivo baseado no tipo
    function getFileIcon(type) {
        if (type.startsWith('image/')) return '🖼️';
        if (type === 'application/pdf') return '📄';
        if (type.includes('word')) return '📝';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        if (type.startsWith('text/')) return '📃';
        return '📎';
    }

    // Função para formatar tamanho do arquivo
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Função para verificar se o arquivo é permitido
    function isFileAllowed(file) {
        const allowedTypes = [
            'image/',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
        ];
        
        return allowedTypes.some(type => 
            file.type.startsWith(type) || file.type === type
        );
    }

    // Função para criar elemento de arquivo para preview
    function createFilePreview(file) {
        const fileDiv = document.createElement('div');
        fileDiv.style.display = 'flex';
        fileDiv.style.alignItems = 'center';
        fileDiv.style.padding = '8px';
        fileDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        fileDiv.style.borderRadius = '8px';
        fileDiv.style.marginBottom = '8px';

        const icon = document.createElement('span');
        icon.style.fontSize = '24px';
        icon.style.marginRight = '12px';
        icon.textContent = getFileIcon(file.type);

        const fileInfo = document.createElement('div');
        fileInfo.style.flex = '1';

        const fileName = document.createElement('div');
        fileName.style.fontWeight = 'bold';
        fileName.style.marginBottom = '4px';
        fileName.textContent = file.name;

        const fileSize = document.createElement('div');
        fileSize.style.fontSize = '12px';
        fileSize.style.color = '#8696a0';
        fileSize.textContent = formatFileSize(file.size);

        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        fileDiv.appendChild(icon);
        fileDiv.appendChild(fileInfo);

        return fileDiv;
    }

    // Função para criar elemento de arquivo com download
    function createDownloadableFile(fileData) {
        const fileDiv = document.createElement('div');
        fileDiv.style.display = 'flex';
        fileDiv.style.alignItems = 'center';
        fileDiv.style.padding = '8px';
        fileDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        fileDiv.style.borderRadius = '8px';
        fileDiv.style.marginBottom = '8px';
        fileDiv.style.cursor = 'pointer';
        fileDiv.style.transition = 'background-color 0.2s';

        // Hover effect
        fileDiv.addEventListener('mouseenter', () => {
            fileDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        fileDiv.addEventListener('mouseleave', () => {
            fileDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });

        const icon = document.createElement('span');
        icon.style.fontSize = '24px';
        icon.style.marginRight = '12px';
        icon.textContent = fileData.icone;

        const fileInfo = document.createElement('div');
        fileInfo.style.flex = '1';

        const fileName = document.createElement('div');
        fileName.style.fontWeight = 'bold';
        fileName.style.marginBottom = '4px';
        fileName.textContent = fileData.nome;

        const fileSize = document.createElement('div');
        fileSize.style.fontSize = '12px';
        fileSize.style.color = '#8696a0';
        fileSize.textContent = `${fileData.tamanho}KB`;

        const downloadIcon = document.createElement('span');
        downloadIcon.style.fontSize = '16px';
        downloadIcon.style.marginLeft = '8px';
        downloadIcon.textContent = '⬇️';

        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        fileDiv.appendChild(icon);
        fileDiv.appendChild(fileInfo);
        fileDiv.appendChild(downloadIcon);

        // Adicionar funcionalidade de download
        fileDiv.addEventListener('click', () => {
            window.open(fileData.url, '_blank');
        });

        return fileDiv;
    }

    // Função para adicionar mensagem ao chat (modificada para suportar arquivos)
    function addMessage(text, isUser = false, imageData = null, fileData = null, filePreview = null) {
        console.log('=== ADICIONANDO MENSAGEM ===');
        console.log('Texto:', text);
        console.log('É usuário:', isUser);
        console.log('Tem imagem:', !!imageData);
        console.log('Tem arquivo:', !!fileData);
        
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

        // Se há um arquivo para preview (usuário enviando)
        if (filePreview) {
            bubble.appendChild(filePreview);
        }

        // Se há um arquivo para download (resposta do bot)
        if (fileData) {
            const downloadableFile = createDownloadableFile(fileData);
            bubble.appendChild(downloadableFile);
        }
        
        // Adicionar texto se existir
        if (text) {
            const textP = document.createElement('p');
            textP.style.margin = '0';
            textP.style.fontSize = '14px';
            textP.style.whiteSpace = 'pre-line'; // Para quebras de linha
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
        
        // Verificar se o arquivo é permitido
        if (!isFileAllowed(file)) {
            alert('Tipo de arquivo não permitido. Tipos aceitos: Imagens, PDF, Word, Excel, TXT, CSV');
            return;
        }
        
        // Verificar tamanho do arquivo (máximo 10MB)
        if (file.size > 100 * 1024 * 1024) {
            alert('O arquivo deve ter no máximo 100MB.');
            return;
        }
        
        try {
            // Se for imagem, mostrar preview da imagem
            if (file.type.startsWith('image/')) {
                const imageData = await createImagePreview(file);
                addMessage('', true, imageData);
            } else {
                // Se for documento, mostrar preview do arquivo
                const filePreview = createFilePreview(file);
                addMessage('', true, null, null, filePreview);
            }
            
            // Enviar para o servidor
            await enviarArquivo(file);
            
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            alert('Erro ao processar o arquivo.');
        }
    }

    // Função para enviar arquivo para o servidor
    async function enviarArquivo(file) {
        try {
            const formData = new FormData();
            formData.append('arquivo', file);
            
            const response = await fetch('/enviar-arquivo', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.resposta) {
                    // Se há dados do arquivo, adicionar com funcionalidade de download
                    if (data.arquivo) {
                        addMessage(data.resposta, false, null, data.arquivo);
                    } else {
                        addMessage(data.resposta, false);
                    }
                }
            } else {
                addMessage('Erro ao enviar arquivo', false);
            }
            
        } catch (error) {
            console.error('Erro ao enviar arquivo:', error);
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
