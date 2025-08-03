// C:/dev/commit.js

const { execSync } = require('child_process');

// Função para executar comandos e capturar a saída
const runCommand = (command) => {
  try {
    // Usamos 'pipe' para que a saída do comando possa ser usada por nós, mas não apareça no terminal
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`\n❌ Falha ao executar o comando: ${command}`);
    // Se o erro for de 'nada para comitar', não é um erro fatal
    if (error.stdout.includes('nothing to commit')) {
        console.warn('⚠️  Nenhuma alteração para comitar.');
        return null;
    }
    process.exit(1);
  }
};

console.log('--- INICIANDO SCRIPT DE COMMIT RÁPIDO ---');

// 1. Prepara todos os arquivos
console.log('\n🔄 Preparando todos os arquivos (git add .)...');
runCommand('git add .');

// 2. Gera a mensagem de commit automática
const currentDate = new Date().toLocaleString('pt-BR');
const commitMessage = `chore(dev): Sincronização de progresso - ${currentDate}`;
console.log(`\n📦 Mensagem de Commit Gerada: "${commitMessage}"`);

// 3. Executa o commit
const commitResult = runCommand(`git commit -m "${commitMessage}"`);

// Se o commitResult for nulo (porque não havia nada para comitar), o script para.
if (commitResult === null) {
    console.log('\n--- FIM DO SCRIPT ---');
    process.exit(0);
}

// 4. Envia para a branch 'develop'
console.log('\n🚀 Enviando para a branch "develop" (git push origin develop)...');
runCommand('git push origin develop');

console.log('\n✅ Processo de commit e push concluído com sucesso!');
console.log('--- FIM DO SCRIPT ---');