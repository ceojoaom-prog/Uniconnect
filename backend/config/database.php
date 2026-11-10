<?php
require_once __DIR__ . '/config.php';

function initializeSchema(PDO $pdo): void
{
    $queries = [
        "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            province VARCHAR(100) NOT NULL,
            school VARCHAR(255) NOT NULL,
            course VARCHAR(255) NOT NULL,
            bio TEXT,
            avatar VARCHAR(10) DEFAULT '',
            followers_count INT DEFAULT 0,
            role VARCHAR(50) DEFAULT 'student',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",

        "CREATE TABLE IF NOT EXISTS profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            avatar VARCHAR(255),
            cover_photo VARCHAR(255),
            followers_count INT DEFAULT 0,
            bio TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            image_path VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_like (post_id, user_id),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS follows (
            id INT AUTO_INCREMENT PRIMARY KEY,
            follower_id INT NOT NULL,
            following_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_follow (follower_id, following_id),
            FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question_id INT NOT NULL,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS videos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            file_path VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS groups_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS group_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT NOT NULL,
            user_id INT NOT NULL,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_group_member (group_id, user_id),
            FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            reported_user_id INT,
            post_id INT,
            reason TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )",

        "CREATE TABLE IF NOT EXISTS admin_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            action VARCHAR(255) NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
        )"
    ];

    foreach ($queries as $query) {
        $pdo->exec($query);
    }

    $count = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ((int) $count === 0) {
        $seed = [
            [
                'full_name' => 'Ana da Silva',
                'email' => 'ana@uem.mz',
                'password_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'province' => 'Maputo',
                'school' => 'Universidade Eduardo Mondlane',
                'course' => 'Engenharia de Software',
                'bio' => 'Estudante apaixonada por tecnologia, aprendizagem e colaboração.',
                'avatar' => 'A',
                'followers_count' => 1284,
                'role' => 'student',
            ],
            [
                'full_name' => 'Samuel Chale',
                'email' => 'samuel@unilurio.mz',
                'password_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'province' => 'Nampula',
                'school' => 'Universidade Licungo',
                'course' => 'Gestão de Empresas',
                'bio' => 'Amo discutir negócios, liderança e projetos acolhedores.',
                'avatar' => 'S',
                'followers_count' => 840,
                'role' => 'student',
            ],
            [
                'full_name' => 'Rita Tamele',
                'email' => 'rita@isptec.mz',
                'password_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'province' => 'Sofala',
                'school' => 'ISPTEM',
                'course' => 'Arquitetura',
                'bio' => 'Criativa, organizada e sempre pronta para aprender em comunidade.',
                'avatar' => 'R',
                'followers_count' => 612,
                'role' => 'student',
            ],
        ];

        foreach ($seed as $user) {
            $stmt = $pdo->prepare('INSERT INTO users (full_name, email, password_hash, province, school, course, bio, avatar, followers_count, role) VALUES (:full_name, :email, :password_hash, :province, :school, :course, :bio, :avatar, :followers_count, :role)');
            $stmt->execute($user);
        }

        $userIds = $pdo->query('SELECT id FROM users ORDER BY id ASC')->fetchAll(PDO::FETCH_COLUMN);
        if (!empty($userIds)) {
            $pdo->exec("INSERT INTO posts (user_id, content, image_path, created_at) VALUES 
                ({$userIds[0]}, 'Estive hoje a revisar conceitos de estruturas de dados com a minha turma. Quem pode partilhar materiais sobre árvores binárias e algoritmos de pesquisa?', '', NOW()),
                ({$userIds[1]}, 'Amanhã vamos ter um grupo de estudo de matemática aplicada. Alguém quer participar?', '', NOW()),
                ({$userIds[2]}, 'Acabei de montar um pequeno resumo de arquitetura sustentável para a apresentação final. Deixo aqui o material.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', NOW())");

            $postIds = $pdo->query('SELECT id FROM posts ORDER BY id ASC')->fetchAll(PDO::FETCH_COLUMN);
            if (count($postIds) >= 3) {
                $pdo->exec("INSERT INTO comments (post_id, user_id, content, created_at) VALUES 
                    ({$postIds[0]}, {$userIds[1]}, 'Posso partilhar uma folha de exercícios.', NOW()),
                    ({$postIds[0]}, {$userIds[2]}, 'Também estou a estudar isso. Vamos criar um grupo de revisão!', NOW()),
                    ({$postIds[1]}, {$userIds[0]}, 'Eu vou! Pode ser às 18h.', NOW())");

                $pdo->exec("INSERT INTO likes (post_id, user_id) VALUES ({$postIds[0]}, {$userIds[1]}), ({$postIds[0]}, {$userIds[2]}), ({$postIds[1]}, {$userIds[0]}), ({$postIds[2]}, {$userIds[0]}), ({$postIds[2]}, {$userIds[1]}), ({$postIds[2]}, {$userIds[2]})");
            }

            $pdo->exec("INSERT INTO questions (user_id, title, content, created_at) VALUES 
                ({$userIds[1]}, 'Como resolver derivadas de funções trigonométricas?', 'Preciso de ajuda para interpretar a regra da cadeia em alguns exercícios de trigonometria.', NOW()),
                ({$userIds[0]}, 'Qual é a melhor forma de organizar material para apresentação final?', 'Queria saber uma estrutura eficiente para organizar slides, pesquisa e referências.', NOW())");

            $pdo->exec("INSERT INTO groups_table (name, description, created_by, created_at) VALUES 
                ('Matemática 12ª', 'Aulas, listas e dúvidas de matemática para estudantes do 12º ano.', {$userIds[0]}, NOW()),
                ('Programação & Tecnologia', 'Projeto, análise e desenvolvimento de soluções digitais.', {$userIds[1]}, NOW()),
                ('Estudantes UEM', 'Comunidade para partilha de eventos e materiais académicos.', {$userIds[2]}, NOW())");

            $pdo->exec("INSERT INTO videos (user_id, title, description, file_path, created_at) VALUES 
                ({$userIds[2]}, 'Introdução à lógica', 'Aula básica de lógica e raciocínio matemático.', 'video-logic.mp4', NOW()),
                ({$userIds[0]}, 'Estatística aplicada', 'Aplicações práticas de estatística para projetos acadêmicos.', 'video-statistics.mp4', NOW()),
                ({$userIds[1]}, 'Programação em JavaScript', 'Noções fundamentais e exemplos práticos.', 'video-javascript.mp4', NOW())");

            $pdo->exec("INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES 
                ({$userIds[0]}, {$userIds[1]}, 'Podes me ajudar com os exercícios de cálculo?', NOW()),
                ({$userIds[1]}, {$userIds[0]}, 'Claro! Posso enviar alguns exemplos.', NOW())");
        }
    }
}

function getDatabase(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $config = require __DIR__ . '/config.php';
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $config['host'],
        $config['dbname'],
        $config['charset']
    );

    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    initializeSchema($pdo);

    return $pdo;
}
