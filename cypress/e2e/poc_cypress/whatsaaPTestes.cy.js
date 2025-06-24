
describe('Teste com servidor fake WhatsApp', () => {
  
  it('Envia mensagem e espera resposta simulada', () => {
    cy.visit('http://localhost:3001/');

    const mensagem = 'Mensagem de teste fake';

    // Aguardar a página carregar
    cy.get('[data-testid="messageInput"]').should('be.visible');
    
    cy.get('#mensagem').type(mensagem);
    cy.get('#sendBtn').click();
    
    // Aguardar resposta do bot
    cy.contains(`Você disse: ${mensagem}`, { timeout: 10000 }).should('exist');
  });

  it('EVerificar se o bot responde com os comandos disponíveis', () => {
    cy.visit('http://localhost:3001/');

    // Aguardar a página carregar
    cy.get('[data-testid="messageInput"]').should('be.visible');
    
    cy.get('#mensagem').type('ajuda');
    cy.get('#sendBtn').click();
    
    // Aguardar resposta do bot
    cy.contains(`Comandos disponíveis: • Digite "token" para gerar um token • Digite "oi" para cumprimentar • Digite qualquer coisa para conversar!`, { timeout: 10000 }).should('exist');
  });
  
  it('Verificar se o bot responde com o token', () => {
    cy.visit('http://localhost:3001/');

    // Aguardar a página carregar
    cy.get('[data-testid="messageInput"]').should('be.visible');
    
    cy.get('#mensagem').type('token');
    cy.get('#sendBtn').click();
    
    // Aguardar resposta do bot
    cy.contains(/Seu token:/, { timeout: 10000 }).should('exist');
  });
});