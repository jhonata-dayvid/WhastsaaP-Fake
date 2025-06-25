const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'), false);
        }
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'app')));

// Função para gerar um token aleatório
function generateRandomToken(length = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Rota para receber mensagens
app.post('/enviar', (req, res) => {
    const {
        mensagem
    } = req.body;

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
        botResponseText = '🤖 Comandos disponíveis:\n• Digite "token" para gerar um token\n• Digite "oi" para cumprimentar\n• Digite qualquer coisa para conversar!\n• Também é possível subir imagens';
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

// Rota para receber imagens (usando o upload configurado)
app.post('/enviar-imagem', upload.single('imagem'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                erro: 'Nenhuma imagem foi enviada'
            });
        }

        console.log('📸 Imagem recebida:', {
            nome: req.file.originalname,
            tamanho: req.file.size,
            tipo: req.file.mimetype
        });

        // Simular processamento da imagem
        const botResponseText = `📸 Imagem "${req.file.originalname}" recebida com sucesso! Tamanho: ${Math.round(req.file.size / 1024)}KB`;

        // Simula delay de processamento
        setTimeout(() => {
            res.json({
                resposta: botResponseText
            });
        }, 1000);

    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor'
        });
    }
});

app.listen(3001, () => {
    console.log('🟢 Fake WhatsApp rodando em http://localhost:3001');
    console.log('💬 Bot pronto para conversar!');
    console.log('📸 Upload de imagens habilitado!');
});