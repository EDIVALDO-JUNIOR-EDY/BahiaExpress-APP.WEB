const { execSync } = require('child_process');
const readline = require('readline');

// Configuração do readline para entrada do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para executar comandos e capturar a saída
const runCommand = (command, options = {}) => {
    try {
        const defaultOptions = { encoding: 'utf8', stdio: 'pipe' };
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Se showOutput for true, exibe a saída no console
        if (options.showOutput) {
            console.log(`> Executando: ${command}`);
            return execSync(command, mergedOptions);
        }
        
        return execSync(command, mergedOptions).trim();
    } catch (error) {
        // Tratamento especial para "nada para comitar"
        if (error.stdout && error.stdout.includes('nothing to commit')) {
            console.warn('\n⚠️  Nenhuma alteração para comitar. O script será encerrado.');
            return null;
        }
        
        // Tratamento especial para "tudo atualizado"
        if (error.stdout && error.stdout.includes('Everything up-to-date')) {
            console.log('\n✅ Tudo já está atualizado.');
            return 'up-to-date';
        }
        
        console.error(`\n❌ Falha ao executar o comando: ${command}`);
        if (error.stdout) console.error(`Saída: ${error.stdout}`);
        if (error.stderr) console.error(`Erro: ${error.stderr}`);
        
        // Se for um erro de merge, podemos tentar recuperar
        if (command.includes('merge') && error.message.includes('CONFLICT')) {
            console.error('\n🔥 Conflito de merge detectado! Abortando merge.');
            return 'merge-conflict';
        }
        
        return null;
    }
};

// Função para verificar se há conflitos
const checkConflicts = () => {
    try {
        const status = runCommand('git status --porcelain');
        return status && status.includes('UU');
    } catch (error) {
        return false;
    }
};

// Função para verificar a branch atual
const getCurrentBranch = () => {
    try {
        return runCommand('git rev-parse --abbrev-ref HEAD');
    } catch (error) {
        return null;
    }
};

// Função para perguntar ao usuário
const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
};

// Função principal
const main = async () => {
    console.log('--- INICIANDO SCRIPT DE COMMIT & DEPLOY AUTOMATIZADO ---');
    
    // Perguntar a mensagem de commit
    const commitMessage = await askQuestion('▶️  Digite a sua mensagem de commit: ');
    if (!commitMessage) {
        console.log('❌ Mensagem de commit não pode ser vazia. Encerrando script.');
        rl.close();
        return;
    }
    
    console.log('\n-------------------------------------------');
    console.log('--- Fase 1: Atualizando a branch "develop" ---');
    console.log('-------------------------------------------');
    
    // Verificar se estamos na branch develop
    const currentBranch = getCurrentBranch();
    if (currentBranch !== 'develop') {
        console.log(`🔄 Mudando para a branch "develop"...`);
        runCommand('git checkout develop', { showOutput: true });
    }
    
    // Fazer add de todos os arquivos
    console.log('> Executando: git add .');
    runCommand('git add .');
    
    // Fazer commit
    console.log(`> Executando: git commit -m "${commitMessage}"`);
    const commitResult = runCommand(`git commit -m "${commitMessage}"`, { showOutput: true });
    
    if (commitResult === null) {
        console.log('⚠️  Nenhuma alteração para comitar. Encerrando script.');
        rl.close();
        return;
    }
    
    // Fazer push para develop
    console.log('> Executando: git push origin develop');
    const pushResult = runCommand('git push origin develop', { showOutput: true });
    
    if (pushResult === 'up-to-date') {
        console.log('✅ Branch develop já está atualizada.');
    } else {
        console.log('✅ Commit enviado com sucesso para a branch "develop".');
    }
    
    console.log('\n-------------------------------------------');
    console.log('--- Fase 2: Sincronizando com a branch "main" para Deploy ---');
    console.log('-------------------------------------------');
    
    // Mudar para a branch main
    console.log('> Executando: git checkout main');
    runCommand('git checkout main', { showOutput: true });
    
    // Fazer pull da main remota
    console.log('> Executando: git pull origin main');
    runCommand('git pull origin main', { showOutput: true });
    
    // Tentar fazer merge da develop
    console.log('> Executando: git merge develop');
    const mergeResult = runCommand('git merge develop', { showOutput: true });
    
    if (mergeResult === 'merge-conflict') {
        console.log('\n❌ Falha ao executar o comando: git merge develop');
        console.log('\n🔥 Conflitos de merge detectados!');
        console.log('📋 Por favor, resolva os conflitos manualmente e execute:');
        console.log('   1. git add . (após resolver os conflitos)');
        console.log('   2. git commit -m "Resolve conflitos de merge"');
        console.log('   3. git push origin main');
        console.log('   4. git checkout develop');
        console.log('\n🔒 Script encerrado. Resolva os conflitos e tente novamente.');
        rl.close();
        return;
    }
    
    // Se chegou aqui, o merge foi bem sucedido
    console.log('✅ Merge concluído com sucesso!');
    
    // Fazer push da main
    console.log('> Executando: git push origin main');
    runCommand('git push origin main', { showOutput: true });
    
    console.log('\n✅ Deploy realizado com sucesso!');
    console.log('🎉 Tudo sincronizado e pronto para produção!');
    
    // Voltar para a branch develop
    console.log('> Executando: git checkout develop');
    runCommand('git checkout develop', { showOutput: true });
    
    console.log('\n--- FIM DO SCRIPT ---');
    rl.close();
};

// Executar a função principal
main().catch(error => {
    console.error('Erro inesperado:', error);
    rl.close();
});