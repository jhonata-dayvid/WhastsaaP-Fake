const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Criar diretório para armazenar arquivos se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Gerar nome único para o arquivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Permitir imagens e documentos
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
        
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type) || file.mimetype === type);
        
        if (isAllowed) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido!'), false);
        }
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'app')));
app.use('/uploads', express.static(uploadsDir)); // Servir arquivos estáticos

// Função para gerar um token aleatório
function generateRandomToken(length = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Função para obter ícone baseado no tipo de arquivo
function getFileIcon(mimetype) {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.startsWith('text/')) return '📃';
    return '📎';
}

// Rota para receber mensagens
app.post('/enviar', (req, res) => {
    const { mensagem } = req.body;

    if (!mensagem) {
        return res.status(400).json({
            erro: 'Mensagem não encontrada'
        });
    }

    console.log('📤 Mensagem recebida:', mensagem);

    let botResponseText = '';

    // Lógica de respostas do bot
    const msgLower = mensagem.toLowerCase();

    if (msgLower.includes('token')) {
        const newToken = generateRandomToken();
        botResponseText = `🎫 Seu token: ${newToken}`;
        console.log('Token gerado:', newToken);
    } else if (msgLower.includes('oi') || msgLower.includes('olá') || msgLower.includes('hello')) {
        botResponseText = '👋 Olá! Como posso ajudar você hoje?';
    } else if (msgLower.includes('ajuda') || msgLower.includes('help')) {
        botResponseText = '🤖 Comandos disponíveis:\n• Digite "token" para gerar um token\n• Digite "oi" para cumprimentar\n• Digite qualquer coisa para conversar!\n• Também é possível subir imagens e documentos (PDF, Word, Excel, TXT)';
    } else if (msgLower.includes('tchau') || msgLower.includes('bye')) {
        botResponseText = '👋 Até logo! Foi um prazer conversar com você!';
    } else {
        botResponseText = `🤖 Você disse: ${mensagem}`;
    }

    console.log('🤖 Resposta:', botResponseText);

    // Simula delay de digitação
    setTimeout(() => {
        res.json({
            resposta: botResponseText
        });
    }, 800);
});

// Rota para receber arquivos (imagens e documentos)
app.post('/enviar-arquivo', upload.single('arquivo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                erro: 'Nenhum arquivo foi enviado'
            });
        }

        console.log('📎 Arquivo recebido:', {
            nome: req.file.originalname,
            tamanho: req.file.size,
            tipo: req.file.mimetype,
            caminho: req.file.path
        });

        const fileIcon = getFileIcon(req.file.mimetype);
        const fileSize = Math.round(req.file.size / 1024);
        const fileUrl = `/uploads/${req.file.filename}`;
        
        // Resposta do bot com informações do arquivo
        const botResponseText = `${fileIcon} Arquivo "${req.file.originalname}" recebido com sucesso!\n📏 Tamanho: ${fileSize}KB\n📥 Clique para baixar`;

        // Simula delay de processamento
        setTimeout(() => {
            res.json({
                resposta: botResponseText,
                arquivo: {
                    nome: req.file.originalname,
                    url: fileUrl,
                    tipo: req.file.mimetype,
                    tamanho: fileSize,
                    icone: fileIcon
                }
            });
        }, 1000);

    } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor'
        });
    }
});

// Rota para download de arquivos
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ erro: 'Arquivo não encontrado' });
    }
});

app.listen(3001, () => {
    console.log('🟢 Fake WhatsApp rodando em http://localhost:3001');
    console.log('💬 Bot pronto para conversar!');
    console.log('📎 Upload de arquivos habilitado!');
    console.log('📁 Arquivos salvos em:', uploadsDir);
});