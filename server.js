/**
 * Arquivo de entrada para compatibilidade com Hostinger e outros serviços de hospedagem.
 * Este arquivo carrega o servidor compilado e garante que variáveis de ambiente sejam respeitadas.
 */
try {
  console.log("Iniciando servidor via server.js...");
  require('./dist/server.cjs');
} catch (error) {
  console.error("Erro fatal ao iniciar o servidor:", error);
  process.exit(1);
}
