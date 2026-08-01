/**
 * Arquivo de entrada principal (app.js) para compatibilidade total com Hostinger e ESM.
 * Este arquivo carrega o servidor compilado e garante que o ambiente de produção seja detectado.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

process.env.NODE_ENV = 'production';

console.log("-----------------------------------------");
console.log("SISTEMA: Roteirizador Faceless Pro");
console.log("AMBIENTE:", process.env.NODE_ENV);
console.log("PORTA:", process.env.PORT || 3000);
console.log("-----------------------------------------");

try {
  console.log("Iniciando bundle do servidor (dist/server.cjs)...");
  require('./dist/server.cjs');
} catch (error) {
  console.error("ERRO CRÍTICO AO CARREGAR O SERVIDOR:");
  console.error(error);
  process.exit(1);
}
