// C:/dev/commit.js

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer perguntas ao usuário
const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Função para executar comandos
const runCommand = (command) => {
  try {
    console.log(`\n> Executando: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Falha ao executar o comando.`);
    process.exit(1);
  }
};

// --- INÍCIO DO SCRIPT ASSÍNCRONO ---
async function main() {
  console.log('--- ASSISTENTE DE COMMIT BAHIAEXPRESS ---');

  // Pergunta 1: Tipo de Commit
  const type = await question(`
▶️  Qual o TIPO da alteração?
    1. feat:  Nova funcionalidade
    2. fix:   Correção de bug
    3. chore: Manutenção (build, config, etc.)
    4. docs:  Mudanças na documentação
    Escolha um número (1-4): `);

  const typeMap = { '1': 'feat', '2': 'fix', '3': 'chore', '4': 'docs' };
  const commitType = typeMap[type.trim()];
  if (!commitType) {
    console.error('❌ Tipo inválido.');
    return;
  }

  // Pergunta 2: Escopo do Commit
  const scope = await question(`▶️  Qual o ESCOPO da alteração? (ex: auth, cliente, ui, build): `);

  // Pergunta 3: Descrição Curta
  const description = await question(`▶️  Descreva a alteração em poucas palavras (ex: adiciona login com google): `);

  // Monta a mensagem final
  const commitMessage = `${commitType}(${scope.trim()}): ${description.trim()}`;

  console.log('\n-------------------------------------------');
  console.log(`✅ Mensagem de Commit Gerada: "${commitMessage}"`);
  console.log('-------------------------------------------');

  runCommand('git add .');
  runCommand(`git commit -m "${commitMessage}"`);
  runCommand('git push origin develop');

  console.log('\n✅ Processo de commit e push concluído com sucesso!');
}

main().finally(() => rl.close());