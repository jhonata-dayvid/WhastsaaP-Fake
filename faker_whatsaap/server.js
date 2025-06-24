const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

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
    const { mensagem } = req.body;
    
    if (!mensagem) {
        return res.status(400).json({ erro: 'Mensagem não encontrada' });
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
        botResponseText = '🤖 Comandos disponíveis:\n• Digite "token" para gerar um token\n• Digite "oi" para cumprimentar\n• Digite qualquer coisa para conversar!';
    } else if (msgLower.includes('tchau') || msgLower.includes('bye')) {
        botResponseText = '👋 Até logo! Foi um prazer conversar com você!';
    } else {
        botResponseText = `🤖 Você disse: ${mensagem}`;
    }

    console.log('🤖 Resposta:', botResponseText);

    // Simula delay de digitação
    setTimeout(() => {
        res.json({ resposta: botResponseText });
    }, 800);
});

app.listen(3001, () => {
    console.log('🟢 Fake WhatsApp rodando em http://localhost:3001');
    console.log('💬 Bot pronto para conversar!');
});
