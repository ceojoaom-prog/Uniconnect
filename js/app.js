const API_URL = 'backend/api.php';

async function apiRequest(action, params = {}, method = 'POST') {
  const formData = new FormData();
  formData.append('action', action);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, {
    method,
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
    },
    body: method === 'POST' ? formData : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao comunicar com a API.');
  }

  return data;
}

function getCurrentUser() {
  const stored = sessionStorage.getItem('uniconnect_user');
  return stored ? JSON.parse(stored) : null;
}

function setCurrentUser(user) {
  if (user) {
    sessionStorage.setItem('uniconnect_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('uniconnect_user');
  }
}

function updateHeaderUser() {
  const user = getCurrentUser();
  const headerUserName = document.querySelectorAll('#headerUserName');
  const composerUserName = document.querySelectorAll('#composerUserName');

  headerUserName.forEach((el) => {
    if (user) {
      el.textContent = user.name.split(' ')[0];
    }
  });

  composerUserName.forEach((el) => {
    if (user) {
      el.textContent = user.name;
    }
  });
}

function bindAuthForms() {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value.trim(),
        province: document.getElementById('province').value.trim(),
        school: document.getElementById('school').value.trim(),
        course: document.getElementById('course').value.trim(),
        bio: document.getElementById('bio').value.trim(),
      };

      try {
        const response = await apiRequest('register', payload, 'POST');
        setCurrentUser(response.user);
        window.location.href = 'feed.html';
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value.trim(),
      };

      try {
        const response = await apiRequest('login', payload, 'POST');
        setCurrentUser(response.user);
        window.location.href = 'feed.html';
      } catch (error) {
        alert(error.message);
      }
    });
  }

  document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const passwordHidden = input.type === 'password';
      input.type = passwordHidden ? 'text' : 'password';
      button.textContent = passwordHidden ? 'Ocultar' : 'Mostrar';
    });
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await apiRequest('logout', {}, 'POST');
        setCurrentUser(null);
        window.location.href = 'login.html';
      } catch (error) {
        console.error(error);
      }
    });
  }
}

async function renderSuggestions() {
  const container = document.getElementById('suggestionsList');
  if (!container) return;

  try {
    const response = await apiRequest('suggestions', {}, 'POST');
    container.innerHTML = response.users.map((user) => `
      <div class="user-list-item">
        <div class="profile-mini">
          <div class="avatar avatar-sm">${user.avatar || user.name.charAt(0).toUpperCase()}</div>
          <div>
            <strong>${user.name}</strong>
            <div class="meta">${user.course}</div>
          </div>
        </div>
        <button class="action-btn" data-follow="${user.id}">Seguir</button>
      </div>
    `).join('');

    document.querySelectorAll('[data-follow]').forEach((button) => {
      button.addEventListener('click', () => alert('Função de seguir activa em backend real.'));
    });
  } catch (error) {
    console.error(error);
  }
}

async function renderFeed() {
  const feedContainer = document.getElementById('feedList');
  if (!feedContainer) return;

  try {
    const response = await apiRequest('feed', {}, 'POST');
    const posts = response.posts || [];

    feedContainer.innerHTML = posts.map((post) => {
      const comments = (post.comments || []).map((comment) => `
        <div class="comment-item">
          <div class="avatar avatar-sm">${(comment.commenter_avatar || comment.commenter_name?.charAt(0) || 'U').toUpperCase()}</div>
          <div>
            <strong>${comment.commenter_name || 'Estudante'}</strong>
            <span>${comment.content}</span>
          </div>
        </div>
      `).join('');

      return `
        <article class="post-card">
          <div class="post-author">
            <div class="avatar avatar-md">${(post.author_avatar || post.author_name?.charAt(0) || 'U').toUpperCase()}</div>
            <div>
              <h4>${post.author_name || 'Estudante'}</h4>
              <small>${post.author_course || 'Estudante'} • ${new Date(post.created_at).toLocaleDateString('pt-PT')}</small>
            </div>
          </div>

          <div class="post-meta">
            <span class="text-muted">${post.author_school || 'Universidade'}</span>
          </div>

          <p class="post-body">${post.content}</p>
          ${post.image ? `<div class="post-media"><img src="${post.image}" alt="Publicação" /></div>` : ''}

          <div class="interactions">
            <div class="action-row">
              <button class="action-btn" data-like-post="${post.id}">${post.liked ? '💙 Gosto' : '🤍 Gosto'} (${post.likes_count || 0})</button>
              <button class="action-btn" data-toggle-comments="${post.id}">💬 Comentários (${(post.comments || []).length})</button>
            </div>
          </div>

          <div class="comment-list">
            ${comments}
            <form class="comment-form" data-comment-form="${post.id}">
              <input type="text" name="comment" placeholder="Escreva um comentário..." required />
              <button type="submit" class="btn btn-secondary">Enviar</button>
            </form>
          </div>
        </article>
      `;
    }).join('');

    document.querySelectorAll('[data-like-post]').forEach((button) => {
      button.addEventListener('click', async () => {
        const postId = button.getAttribute('data-like-post');
        try {
          await apiRequest('like_post', { postId }, 'POST');
          renderFeed();
        } catch (error) {
          alert(error.message);
        }
      });
    });

    document.querySelectorAll('[data-comment-form]').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const postId = form.getAttribute('data-comment-form');
        const input = form.querySelector('input[name="comment"]');
        try {
          await apiRequest('add_comment', { postId, text: input.value.trim() }, 'POST');
          input.value = '';
          renderFeed();
        } catch (error) {
          alert(error.message);
        }
      });
    });
  } catch (error) {
    console.error(error);
    feedContainer.innerHTML = '<div class="card"><p>Não foi possível carregar o feed.</p></div>';
  }
}

async function renderExplore() {
  const container = document.getElementById('exploreContent');
  if (!container) return;

  try {
    const response = await apiRequest('suggestions', {}, 'POST');
    container.innerHTML = response.users.map((user) => `
      <article class="user-card">
        <div class="profile-mini">
          <div class="avatar avatar-md">${(user.avatar || user.name.charAt(0) || 'U').toUpperCase()}</div>
          <div>
            <h3>${user.name}</h3>
            <div class="meta">${user.course} • ${user.school}</div>
          </div>
        </div>
        <p class="text-muted">${user.bio || 'Estudante ativo da comunidade UniConnect.'}</p>
        <div class="profile-stats">
          <div><strong>${user.followers || 0}</strong><span>seguidores</span></div>
          <div><strong>12</strong><span>publicações</span></div>
        </div>
        <button class="btn btn-secondary" data-follow="${user.id}">Seguir</button>
      </article>
    `).join('');
  } catch (error) {
    console.error(error);
  }
}

async function renderQuestions() {
  const container = document.getElementById('questionsList');
  if (!container) return;

  try {
    const response = await apiRequest('questions', {}, 'POST');
    container.innerHTML = (response.questions || []).map((question) => `
      <article class="question-card">
        <h3>${question.title}</h3>
        <p class="text-muted">${question.content}</p>
        <div class="meta">Perguntado por ${question.author_name} • ${new Date(question.created_at).toLocaleDateString('pt-PT')}</div>
        <div class="action-row" style="margin-top:12px;">
          <button class="action-btn">💬 0 respostas</button>
          <button class="action-btn">✅ Marcar como resolvida</button>
        </div>
      </article>
    `).join('');
  } catch (error) {
    console.error(error);
  }
}

async function renderGroups() {
  const container = document.getElementById('groupsList');
  if (!container) return;

  try {
    const response = await apiRequest('groups', {}, 'POST');
    container.innerHTML = (response.groups || []).map((group) => `
      <article class="group-card">
        <h3>${group.name}</h3>
        <p class="text-muted">${group.description}</p>
        <div class="meta">540 membros • Atualizado hoje</div>
        <button class="btn btn-secondary" style="margin-top:12px;">Participar</button>
      </article>
    `).join('');
  } catch (error) {
    console.error(error);
  }
}

async function renderVideos() {
  const container = document.getElementById('videosList');
  if (!container) return;

  try {
    const response = await apiRequest('videos', {}, 'POST');
    container.innerHTML = (response.videos || []).map((video) => `
      <article class="video-card">
        <div class="video-thumb">▶</div>
        <div class="card-body">
          <h3>${video.title}</h3>
          <div class="meta">${video.description || 'Video educativo'} • 08:42</div>
          <button class="btn btn-secondary" style="margin-top:12px;">Assistir</button>
        </div>
      </article>
    `).join('');
  } catch (error) {
    console.error(error);
  }
}

async function renderMessages() {
  const container = document.getElementById('messagesList');
  if (!container) return;

  try {
    const response = await apiRequest('messages', {}, 'POST');
    const currentUser = getCurrentUser();
    container.innerHTML = (response.messages || []).map((message) => {
      const sent = String(message.sender_id) === String(currentUser?.id || '');
      return `<div class="message-row ${sent ? 'sent' : 'received'}">${message.message}</div>`;
    }).join('');
  } catch (error) {
    console.error(error);
  }
}

async function renderProfile() {
  const container = document.getElementById('profileContent');
  if (!container) return;

  try {
    const response = await apiRequest('profile', {}, 'POST');
    const user = response.user;
    const userPosts = user.posts || [];

    container.innerHTML = `
      <article class="profile-card">
        <div class="profile-cover"></div>
        <div class="profile-body">
          <div class="profile-top-row">
            <div class="profile-head">
              <div class="avatar avatar-lg">${(user.avatar || user.name.charAt(0) || 'U').toUpperCase()}</div>
              <div>
                <h2>${user.name}</h2>
                <div class="profile-meta">${user.course} • ${user.school}</div>
              </div>
            </div>
            <button class="btn btn-secondary">Editar perfil</button>
          </div>

          <p class="profile-bio">${user.bio || 'Estudante ativo do UniConnect.'}</p>

          <div class="profile-stats">
            <div><strong>${user.followers || 0}</strong><span>seguidores</span></div>
            <div><strong>${userPosts.length}</strong><span>publicações</span></div>
            <div><strong>6</strong><span>grupos</span></div>
          </div>

          <div class="meta">📍 ${user.province} • ✉️ ${user.email}</div>
        </div>
      </article>

      <section class="feed-list">
        ${userPosts.length ? userPosts.map((post) => `
          <article class="post-card">
            <div class="post-author">
              <div class="avatar avatar-md">${(user.avatar || user.name.charAt(0) || 'U').toUpperCase()}</div>
              <div>
                <h4>${user.name}</h4>
                <small>${new Date(post.created_at).toLocaleDateString('pt-PT')}</small>
              </div>
            </div>
            <p class="post-body">${post.content}</p>
            ${post.image ? `<div class="post-media"><img src="${post.image}" alt="Publicação" /></div>` : ''}
          </article>
        `).join('') : '<div class="card empty-state"><p>Ainda não tens publicações. Cria a tua primeira atualização.</p></div>'}
      </section>
    `;
  } catch (error) {
    console.error(error);
  }
}

function bindPostComposer() {
  const form = document.getElementById('postForm');
  if (!form) return;

  const imageInput = document.getElementById('postImage');
  const previewBox = document.getElementById('imagePreview');

  imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      previewBox.classList.add('hidden');
      previewBox.innerHTML = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewBox.classList.remove('hidden');
      previewBox.innerHTML = `<img src="${e.target.result}" alt="Pré-visualização" />`;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const content = document.getElementById('postContent').value.trim();
    const image = previewBox?.querySelector('img') ? previewBox.querySelector('img').src : '';

    if (!content && !image) {
      alert('Escreve algo ou selecione uma imagem antes de publicar.');
      return;
    }

    try {
      await apiRequest('create_post', { content, image }, 'POST');
      form.reset();
      previewBox.innerHTML = '';
      previewBox.classList.add('hidden');
      renderFeed();
    } catch (error) {
      alert(error.message);
    }
  });
}

function bindQuestionForm() {
  const form = document.getElementById('questionForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('questionTitle').value.trim();
    const text = document.getElementById('questionText').value.trim();

    if (!title || !text) {
      alert('Preencha o título e a descrição da pergunta.');
      return;
    }

    try {
      await apiRequest('create_question', { title, text }, 'POST');
      form.reset();
      renderQuestions();
    } catch (error) {
      alert(error.message);
    }
  });
}

function bindMessageForm() {
  const form = document.getElementById('messageForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = document.getElementById('messageInput').value.trim();
    if (!text) return;

    try {
      await apiRequest('send_message', { text, receiverId: 2 }, 'POST');
      document.getElementById('messageInput').value = '';
      renderMessages();
    } catch (error) {
      alert(error.message);
    }
  });
}

async function routePage() {
  const page = document.body.dataset.page;

  try {
    const session = await apiRequest('session', {}, 'POST');
    if (!session.user && (page === 'feed' || page === 'explore' || page === 'questions' || page === 'videos' || page === 'groups' || page === 'messages' || page === 'profile' || page === 'settings')) {
      window.location.href = 'login.html';
      return;
    }

    if (session.user) {
      setCurrentUser(session.user);
    }
  } catch (error) {
    if (page !== 'landing' && page !== 'auth') {
      window.location.href = 'login.html';
      return;
    }
  }

  updateHeaderUser();

  switch (page) {
    case 'feed':
      renderFeed();
      renderSuggestions();
      break;
    case 'explore':
      renderExplore();
      break;
    case 'questions':
      renderQuestions();
      break;
    case 'videos':
      renderVideos();
      break;
    case 'groups':
      renderGroups();
      break;
    case 'messages':
      renderMessages();
      break;
    case 'profile':
      renderProfile();
      break;
    default:
      break;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindAuthForms();
  bindPostComposer();
  bindQuestionForm();
  bindMessageForm();
  routePage();
});
