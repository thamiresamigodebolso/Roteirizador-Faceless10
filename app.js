/**
 * Arquivo de entrada principal (app.js) para compatibilidade total com Hostinger Node.js Selector.
 * Este arquivo carrega o servidor compilado e garante que o ambiente de produção seja detectado.
 */
process.env.NODE_ENV = 'production';

try {
  console.log("Iniciando Roteirizador Faceless Pro...");
  // Carrega o bundle gerado pelo esbuild
  require('./dist/server.cjs');
} catch (error) {
  console.error("ERRO CRÍTICO NO SERVIDOR:");
  console.error(error);
  process.exit(1);
}
