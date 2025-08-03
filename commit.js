// C:/dev/commit.js

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const runCommand = (command) => {
  try {
    console.log(`\n> Executando: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Falha ao executar o comando: ${command}`);
    process.exit(1);
  }
};

// --- Início do Script ---
console.log('--- INICIANDO SCRIPT DE COMMIT & DEPLOY AUTOMATIZADO ---');

rl.question('▶️  Digite a sua mensagem de commit: ', (commitMessage) => {
  if (!commitMessage || commitMessage.trim() === '') {
    console.error('❌ A mensagem de commit não pode ser vazia.');
    rl.close();
    process.exit(1);
  }

  console.log('\n-------------------------------------------');
  console.log('--- Fase 1: Atualizando a branch "develop" ---');
  console.log('-------------------------------------------');
  
  runCommand('git add .');
  runCommand(`git commit -m "${commitMessage}"`);
  runCommand('git push origin develop');

  console.log('\n✅ Commit enviado com sucesso para a branch "develop".');
  
  console.log('\n-------------------------------------------');
  console.log('--- Fase 2: Sincronizando com a branch "main" para Deploy ---');
  console.log('-------------------------------------------');
  
  runCommand('git checkout main');
  runCommand('git pull origin main');
  runCommand('git merge develop');
  runCommand('git push origin main');
  runCommand('git checkout develop'); // Volta para a develop para o próximo ciclo

  console.log('\n🚀 Alterações enviadas para a "main". O deploy na Render deve começar.');
  console.log('\n--- FIM DO SCRIPT ---');
  
  rl.close();
});