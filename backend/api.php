<?php
session_start();

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

function apiResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

function currentUserId(): ?int
{
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}

function requireAuth(): int
{
    $userId = currentUserId();
    if ($userId === null) {
        apiResponse(['success' => false, 'message' => 'Sessão expirada. Faça login novamente.'], 401);
    }

    return $userId;
}

$db = getDatabase();
$action = $_REQUEST['action'] ?? '';

if ($action === 'session') {
    $userId = currentUserId();
    if ($userId === null) {
        apiResponse(['success' => false, 'user' => null]);
    }

    $stmt = $db->prepare('SELECT id, full_name AS name, email, province, school, course, bio, avatar, followers_count AS followers, role FROM users WHERE id = :id');
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    apiResponse(['success' => true, 'user' => $user]);
}

if ($action === 'register') {
    $fullName = trim((string) ($_POST['fullName'] ?? ''));
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $password = (string) ($_POST['password'] ?? '');
    $province = trim((string) ($_POST['province'] ?? ''));
    $school = trim((string) ($_POST['school'] ?? ''));
    $course = trim((string) ($_POST['course'] ?? ''));
    $bio = trim((string) ($_POST['bio'] ?? ''));

    if ($fullName === '' || $email === '' || $password === '' || $province === '' || $school === '' || $course === '') {
        apiResponse(['success' => false, 'message' => 'Preencha todos os campos obrigatórios.'], 400);
    }

    $check = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $check->execute([':email' => $email]);
    if ($check->fetch()) {
        apiResponse(['success' => false, 'message' => 'Este email já está registado.'], 409);
    }

    $stmt = $db->prepare('INSERT INTO users (full_name, email, password_hash, province, school, course, bio, avatar, followers_count, role) VALUES (:full_name, :email, :password_hash, :province, :school, :course, :bio, :avatar, :followers_count, :role)');
    $stmt->execute([
        ':full_name' => $fullName,
        ':email' => $email,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':province' => $province,
        ':school' => $school,
        ':course' => $course,
        ':bio' => $bio !== '' ? $bio : 'Novo estudante no UniConnect.',
        ':avatar' => strtoupper(substr($fullName, 0, 1)),
        ':followers_count' => 0,
        ':role' => 'student',
    ]);

    $userId = (int) $db->lastInsertId();
    $_SESSION['user_id'] = $userId;

    $user = $db->prepare('SELECT id, full_name AS name, email, province, school, course, bio, avatar, followers_count AS followers, role FROM users WHERE id = :id');
    $user->execute([':id' => $userId]);

    apiResponse(['success' => true, 'message' => 'Conta criada com sucesso.', 'user' => $user->fetch()]);
}

if ($action === 'login') {
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $password = (string) ($_POST['password'] ?? '');

    if ($email === '' || $password === '') {
        apiResponse(['success' => false, 'message' => 'Email e palavra-passe obrigatórios.'], 400);
    }

    $stmt = $db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        apiResponse(['success' => false, 'message' => 'Email ou palavra-passe inválidos.'], 401);
    }

    $_SESSION['user_id'] = (int) $user['id'];
    unset($user['password_hash']);
    $user['name'] = $user['full_name'];
    unset($user['full_name']);
    $user['followers'] = (int) $user['followers_count'];
    unset($user['followers_count']);

    apiResponse(['success' => true, 'message' => 'Login bem-sucedido.', 'user' => $user]);
}

if ($action === 'logout') {
    session_unset();
    session_destroy();
    apiResponse(['success' => true, 'message' => 'Sessão terminada.']);
}

if ($action === 'suggestions') {
    $userId = requireAuth();
    $stmt = $db->prepare('SELECT id, full_name AS name, email, course, school, bio, avatar, followers_count AS followers FROM users WHERE id != :userId ORDER BY followers_count DESC LIMIT 3');
    $stmt->execute([':userId' => $userId]);
    apiResponse(['success' => true, 'users' => $stmt->fetchAll()]);
}

if ($action === 'feed') {
    requireAuth();
    $stmt = $db->query('SELECT p.id, p.user_id, p.content, p.image_path AS image, p.created_at, u.full_name AS author_name, u.course AS author_course, u.school AS author_school, u.avatar AS author_avatar FROM posts p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC');
    $posts = $stmt->fetchAll();

    foreach ($posts as &$post) {
        $likeStmt = $db->prepare('SELECT COUNT(*) FROM likes WHERE post_id = :postId');
        $likeStmt->execute([':postId' => $post['id']]);
        $post['likes_count'] = (int) $likeStmt->fetchColumn();

        $likedStmt = $db->prepare('SELECT COUNT(*) FROM likes WHERE post_id = :postId AND user_id = :userId');
        $likedStmt->execute([':postId' => $post['id'], ':userId' => currentUserId()]);
        $post['liked'] = (bool) $likedStmt->fetchColumn();

        $commentStmt = $db->prepare('SELECT c.id, c.user_id, c.content, c.created_at, u.full_name AS commenter_name, u.avatar AS commenter_avatar FROM comments c JOIN users u ON u.id = c.user_id WHERE c.post_id = :postId ORDER BY c.created_at ASC');
        $commentStmt->execute([':postId' => $post['id']]);
        $post['comments'] = $commentStmt->fetchAll();
    }

    apiResponse(['success' => true, 'posts' => $posts]);
}

if ($action === 'create_post') {
    $userId = requireAuth();
    $content = trim((string) ($_POST['content'] ?? ''));
    $image = trim((string) ($_POST['image'] ?? ''));

    if ($content === '' && $image === '') {
        apiResponse(['success' => false, 'message' => 'Escreva algo ou escolha uma imagem.'], 400);
    }

    $stmt = $db->prepare('INSERT INTO posts (user_id, content, image_path, created_at) VALUES (:user_id, :content, :image_path, NOW())');
    $stmt->execute([
        ':user_id' => $userId,
        ':content' => $content,
        ':image_path' => $image,
    ]);

    apiResponse(['success' => true, 'message' => 'Publicação criada com sucesso.']);
}

if ($action === 'like_post') {
    $userId = requireAuth();
    $postId = (int) ($_POST['postId'] ?? 0);
    if ($postId <= 0) {
        apiResponse(['success' => false, 'message' => 'Publicação inválida.'], 400);
    }

    $check = $db->prepare('SELECT id FROM likes WHERE post_id = :postId AND user_id = :userId LIMIT 1');
    $check->execute([':postId' => $postId, ':userId' => $userId]);
    if ($check->fetch()) {
        $db->prepare('DELETE FROM likes WHERE post_id = :postId AND user_id = :userId')->execute([':postId' => $postId, ':userId' => $userId]);
    } else {
        $db->prepare('INSERT INTO likes (post_id, user_id) VALUES (:postId, :userId)')->execute([':postId' => $postId, ':userId' => $userId]);
    }

    $count = $db->prepare('SELECT COUNT(*) FROM likes WHERE post_id = :postId');
    $count->execute([':postId' => $postId]);
    apiResponse(['success' => true, 'likes_count' => (int) $count->fetchColumn()]);
}

if ($action === 'add_comment') {
    $userId = requireAuth();
    $postId = (int) ($_POST['postId'] ?? 0);
    $text = trim((string) ($_POST['text'] ?? ''));

    if ($postId <= 0 || $text === '') {
        apiResponse(['success' => false, 'message' => 'Comentário inválido.'], 400);
    }

    $db->prepare('INSERT INTO comments (post_id, user_id, content, created_at) VALUES (:postId, :userId, :text, NOW())')->execute([
        ':postId' => $postId,
        ':userId' => $userId,
        ':text' => $text,
    ]);

    apiResponse(['success' => true, 'message' => 'Comentário adicionado.']);
}

if ($action === 'questions') {
    requireAuth();
    $stmt = $db->query('SELECT q.id, q.title, q.content, q.created_at, u.full_name AS author_name FROM questions q JOIN users u ON u.id = q.user_id ORDER BY q.created_at DESC');
    apiResponse(['success' => true, 'questions' => $stmt->fetchAll()]);
}

if ($action === 'create_question') {
    $userId = requireAuth();
    $title = trim((string) ($_POST['title'] ?? ''));
    $text = trim((string) ($_POST['text'] ?? ''));

    if ($title === '' || $text === '') {
        apiResponse(['success' => false, 'message' => 'Título e texto da pergunta são obrigatórios.'], 400);
    }

    $db->prepare('INSERT INTO questions (user_id, title, content, created_at) VALUES (:userId, :title, :text, NOW())')->execute([
        ':userId' => $userId,
        ':title' => $title,
        ':text' => $text,
    ]);

    apiResponse(['success' => true, 'message' => 'Pergunta publicada com sucesso.']);
}

if ($action === 'groups') {
    requireAuth();
    $stmt = $db->query('SELECT id, name, description FROM groups_table ORDER BY id DESC');
    apiResponse(['success' => true, 'groups' => $stmt->fetchAll()]);
}

if ($action === 'videos') {
    requireAuth();
    $stmt = $db->query('SELECT id, title, description, file_path AS file, created_at FROM videos ORDER BY created_at DESC');
    apiResponse(['success' => true, 'videos' => $stmt->fetchAll()]);
}

if ($action === 'messages') {
    $userId = requireAuth();
    $stmt = $db->prepare('SELECT m.id, m.sender_id, m.receiver_id, m.message, m.created_at FROM messages m WHERE (m.sender_id = :userId OR m.receiver_id = :userId) ORDER BY m.created_at ASC');
    $stmt->execute([':userId' => $userId]);
    apiResponse(['success' => true, 'messages' => $stmt->fetchAll()]);
}

if ($action === 'send_message') {
    $userId = requireAuth();
    $text = trim((string) ($_POST['text'] ?? ''));
    $receiverId = (int) ($_POST['receiverId'] ?? 2);

    if ($text === '') {
        apiResponse(['success' => false, 'message' => 'Mensagem vazia.'], 400);
    }

    $db->prepare('INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (:sender_id, :receiver_id, :message, NOW())')->execute([
        ':sender_id' => $userId,
        ':receiver_id' => $receiverId,
        ':message' => $text,
    ]);

    apiResponse(['success' => true, 'message' => 'Mensagem enviada.']);
}

if ($action === 'profile') {
    $userId = requireAuth();
    $userStmt = $db->prepare('SELECT id, full_name AS name, email, province, school, course, bio, avatar, followers_count AS followers FROM users WHERE id = :id');
    $userStmt->execute([':id' => $userId]);
    $user = $userStmt->fetch();

    $postsStmt = $db->prepare('SELECT id, content, image_path AS image, created_at FROM posts WHERE user_id = :userId ORDER BY created_at DESC');
    $postsStmt->execute([':userId' => $userId]);
    $user['posts'] = $postsStmt->fetchAll();

    apiResponse(['success' => true, 'user' => $user]);
}

apiResponse(['success' => false, 'message' => 'Ação inválida.'], 404);
