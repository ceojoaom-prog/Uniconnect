const STORAGE_KEY = 'uniconnect_data_v1';

const defaultState = {
  users: [
    {
      id: 'u1',
      name: 'Ana da Silva',
      email: 'ana@uem.mz',
      password: '123456',
      province: 'Maputo',
      school: 'Universidade Eduardo Mondlane',
      course: 'Engenharia de Software',
      bio: 'Estudante apaixonada por tecnologia, aprendizagem e colaboração.',
      avatar: 'A',
      followers: 1284,
      role: 'student'
    },
    {
      id: 'u2',
      name: 'Samuel Chale',
      email: 'samuel@unilurio.mz',
      password: '123456',
      province: 'Nampula',
      school: 'Universidade Licungo',
      course: 'Gestão de Empresas',
      bio: 'Amo discutir negócios, liderança e projetos acolhedores.',
      avatar: 'S',
      followers: 840,
      role: 'student'
    },
    {
      id: 'u3',
      name: 'Rita Tamele',
      email: 'rita@isptec.mz',
      password: '123456',
      province: 'Sofala',
      school: 'ISPTEM',
      course: 'Arquitetura',
      bio: 'Criativa, organizada e sempre pronta para aprender em comunidade.',
      avatar: 'R',
      followers: 612,
      role: 'student'
    }
  ],
  posts: [
    {
      id: 'p1',
      userId: 'u1',
      content: 'Estive hoje a revisar conceitos de estruturas de dados com a minha turma. Quem pode partilhar materiais sobre árvores binárias e algoritmos de pesquisa?',
      image: '',
      createdAt: new Date().toISOString(),
      likes: ['u2', 'u3'],
      comments: [
        { id: 'c1', userId: 'u2', text: 'Posso partilhar uma folha de exercícios.', createdAt: new Date().toISOString() },
        { id: 'c2', userId: 'u3', text: 'Também estou a estudar isso. Vamos criar um grupo de revisão!', createdAt: new Date().toISOString() }
      ]
    },
    {
      id: 'p2',
      userId: 'u2',
      content: 'Amanhã vamos ter um grupo de estudo de matemática aplicada. Alguém quer participar?',
      image: '',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      likes: ['u1'],
      comments: [
        { id: 'c3', userId: 'u1', text: 'Eu vou! Pode ser às 18h.', createdAt: new Date(Date.now() - 1800000).toISOString() }
      ]
    },
    {
      id: 'p3',
      userId: 'u3',
      content: 'Acabei de montar um pequeno resumo de arquitetura sustentável para a apresentação final. Deixo aqui o material.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      likes: ['u1', 'u2', 'u3'],
      comments: []
    }
  ],
  questions: [
    {
      id: 'q1',
      userId: 'u2',
      title: 'Como resolver derivadas de funções trigonométricas?',
      text: 'Preciso de ajuda para interpretar a regra da cadeia em alguns exercícios de trigonometria.',
      answers: 3,
      createdAt: new Date(Date.now() - 1500000).toISOString()
    },
    {
      id: 'q2',
      userId: 'u1',
      title: 'Qual é a melhor forma de organizar material para apresentação final?',
      text: 'Queria saber uma estrutura eficiente para organizar slides, pesquisa e referências.',
      answers: 5,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  groups: [
    { id: 'g1', name: 'Matemática 12ª', members: 540, description: 'Aulas, listas e dúvidas de matemática para estudantes do 12º ano.' },
    { id: 'g2', name: 'Programação & Tecnologia', members: 780, description: 'Projeto, análise e desenvolvimento de soluções digitais.' },
    { id: 'g3', name: 'Estudantes UEM', members: 910, description: 'Comunidade para partilha de eventos e materiais académicos.' }
  ],
  videos: [
    { id: 'v1', title: 'Introdução à lógica', creator: 'Rita Tamele', duration: '08:42' },
    { id: 'v2', title: 'Estatística aplicada', creator: 'Ana da Silva', duration: '12:10' },
    { id: 'v3', title: 'Programação em JavaScript', creator: 'Samuel Chale', duration: '09:55' }
  ],
  messages: [
    { id: 'm1', senderId: 'u1', receiverId: 'u2', text: 'Podes me ajudar com os exercícios de cálculo?', createdAt: new Date().toISOString() },
    { id: 'm2', senderId: 'u2', receiverId: 'u1', text: 'Claro! Posso enviar alguns exemplos.', createdAt: new Date().toISOString() }
  ]
};

function getData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return structuredClone(defaultState);
    }
    return stored;
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return structuredClone(defaultState);
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function initializeApp() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    saveData(defaultState);
  }
}

function getCurrentUser() {
  const currentUserId = sessionStorage.getItem('uniconnect_user_id');
  const data = getData();
  return data.users.find((user) => user.id === currentUserId) || null;
}

function setCurrentUser(userId) {
  sessionStorage.setItem('uniconnect_user_id', userId);
}

function logoutUser() {
  sessionStorage.removeItem('uniconnect_user_id');
  window.location.href = 'login.html';
}

function getUserById(userId) {
  const data = getData();
  return data.users.find((user) => user.id === userId);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return `${date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })} às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
}

function updateHeaderUser() {
  const user = getCurrentUser();
  document.querySelectorAll('#headerUserName').forEach((el) => {
    if (user) {
      el.textContent = user.name.split(' ')[0];
    }
  });

  document.querySelectorAll('#composerUserName').forEach((el) => {
    if (user) {
      el.textContent = user.name;
    }
  });
}

function bindAuthForms() {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('fullName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value.trim();
      const province = document.getElementById('province').value.trim();
      const school = document.getElementById('school').value.trim();
      const course = document.getElementById('course').value.trim();
      const bio = document.getElementById('bio').value.trim();

      const data = getData();
      if (data.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
        alert('Este email já está registado.');
        return;
      }

      const newUser = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
        province,
        school,
        course,
        bio: bio || 'Novo estudante no UniConnect.',
        avatar: name.charAt(0).toUpperCase(),
        followers: 0,
        role: 'student'
      };

      data.users.push(newUser);
      saveData(data);
      setCurrentUser(newUser.id);
      window.location.href = 'feed.html';
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const data = getData();
      const user = data.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);

      if (!user) {
        alert('Email ou palavra-passe inválidos.');
        return;
      }

      setCurrentUser(user.id);
      window.location.href = 'feed.html';
    });
  }

  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      button.textContent = isPassword ? 'Ocultar' : 'Mostrar';
    });
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
}

function renderSuggestions() {
  const container = document.getElementById('suggestionsList');
  if (!container) return;

  const data = getData();
  const suggestions = data.users.slice(0, 3);
  container.innerHTML = suggestions
    .map((user) => `
      <div class="user-list-item">
        <div class="user-list-item profile-mini">
          <div class="avatar avatar-sm">${escapeHtml(user.avatar)}</div>
          <div>
            <strong>${escapeHtml(user.name)}</strong>
            <div class="meta">${escapeHtml(user.course)}</div>
          </div>
        </div>
        <button class="action-btn" data-follow="${user.id}">Seguir</button>
      </div>
    `)
    .join('');
}

function renderFeed() {
  const feedContainer = document.getElementById('feedList');
  if (!feedContainer) return;

  const data = getData();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const posts = [...data.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  feedContainer.innerHTML = posts
    .map((post) => {
      const author = getUserById(post.userId) || currentUser;
      const liked = post.likes.includes(currentUser.id);
      const commentCount = post.comments.length;
      const hasImage = post.image ? `<div class="post-media"><img src="${post.image}" alt="Publicação de ${escapeHtml(author.name)}" /></div>` : '';

      return `
        <article class="post-card" data-post-id="${post.id}">
          <div class="post-author">
            <div class="avatar avatar-md">${escapeHtml(author.avatar)}</div>
            <div>
              <h4>${escapeHtml(author.name)}</h4>
              <small>${escapeHtml(author.course)} • ${formatTime(post.createdAt)}</small>
            </div>
          </div>

          <div class="post-meta">
            <span class="text-muted">${escapeHtml(author.school)}</span>
            ${post.userId === currentUser.id ? `<button class="action-btn delete-post" data-delete-post="${post.id}">Eliminar</button>` : ''}
          </div>

          <p class="post-body">${escapeHtml(post.content)}</p>
          ${hasImage}

          <div class="interactions">
            <div class="action-row">
              <button class="action-btn like-btn" data-like-post="${post.id}">${liked ? '💙 Gosto' : '🤍 Gosto'} (${post.likes.length})</button>
              <button class="action-btn" data-toggle-comments="${post.id}">💬 Comentários (${commentCount})</button>
              <button class="action-btn">🔁 Partilhar</button>
            </div>
          </div>

          <div class="comment-list">
            ${post.comments.map((comment) => {
              const commenter = getUserById(comment.userId) || currentUser;
              return `
                <div class="comment-item">
                  <div class="avatar avatar-sm">${escapeHtml(commenter.avatar)}</div>
                  <div>
                    <strong>${escapeHtml(commenter.name)}</strong>
                    <span>${escapeHtml(comment.text)}</span>
                  </div>
                </div>
              `;
            }).join('')}

            <form class="comment-form" data-comment-form="${post.id}">
              <input type="text" name="comment" placeholder="Escreva um comentário..." required />
              <button type="submit" class="btn btn-secondary">Enviar</button>
            </form>
          </div>
        </article>
      `;
    })
    .join('');

  bindFeedInteractions();
}

function renderExplore() {
  const container = document.getElementById('exploreContent');
  if (!container) return;

  const data = getData();
  container.innerHTML = data.users.map((user) => `
    <article class="user-card">
      <div class="profile-mini">
        <div class="avatar avatar-md">${escapeHtml(user.avatar)}</div>
        <div>
          <h3>${escapeHtml(user.name)}</h3>
          <div class="meta">${escapeHtml(user.course)} • ${escapeHtml(user.school)}</div>
        </div>
      </div>
      <p class="text-muted">${escapeHtml(user.bio)}</p>
      <div class="profile-stats">
        <div><strong>${user.followers}</strong><span>seguidores</span></div>
        <div><strong>12</strong><span>publicações</span></div>
      </div>
      <button class="btn btn-secondary" data-follow="${user.id}">Seguir</button>
    </article>
  `).join('');
}

function renderQuestions() {
  const container = document.getElementById('questionsList');
  if (!container) return;

  const data = getData();
  container.innerHTML = data.questions.map((question) => {
    const author = getUserById(question.userId);
    return `
      <article class="question-card">
        <h3>${escapeHtml(question.title)}</h3>
        <p class="text-muted">${escapeHtml(question.text)}</p>
        <div class="meta">Perguntado por ${escapeHtml(author ? author.name : 'Estudante')} • ${formatTime(question.createdAt)}</div>
        <div class="action-row" style="margin-top:12px;">
          <button class="action-btn">💬 ${question.answers} respostas</button>
          <button class="action-btn">✅ Marcar como resolvida</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderGroups() {
  const container = document.getElementById('groupsList');
  if (!container) return;

  const data = getData();
  container.innerHTML = data.groups.map((group) => `
    <article class="group-card">
      <h3>${escapeHtml(group.name)}</h3>
      <p class="text-muted">${escapeHtml(group.description)}</p>
      <div class="meta">${group.members} membros • Atualizado hoje</div>
      <button class="btn btn-secondary" style="margin-top:12px;">Participar</button>
    </article>
  `).join('');
}

function renderVideos() {
  const container = document.getElementById('videosList');
  if (!container) return;

  const data = getData();
  container.innerHTML = data.videos.map((video) => `
    <article class="video-card">
      <div class="video-thumb">▶</div>
      <div class="card-body">
        <h3>${escapeHtml(video.title)}</h3>
        <div class="meta">${escapeHtml(video.creator)} • ${video.duration}</div>
        <button class="btn btn-secondary" style="margin-top:12px;">Assistir</button>
      </div>
    </article>
  `).join('');
}

function renderMessages() {
  const container = document.getElementById('messagesList');
  if (!container) return;

  const currentUser = getCurrentUser();
  const data = getData();

  if (!currentUser) {
    return;
  }

  container.innerHTML = data.messages.map((message) => {
    const sent = message.senderId === currentUser.id;
    return `
      <div class="message-row ${sent ? 'sent' : 'received'}">${escapeHtml(message.text)}</div>
    `;
  }).join('');
}

function renderProfile() {
  const container = document.getElementById('profileContent');
  if (!container) return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const data = getData();
  const userPosts = data.posts.filter((post) => post.userId === currentUser.id);

  container.innerHTML = `
    <article class="profile-card">
      <div class="profile-cover"></div>
      <div class="profile-body">
        <div class="profile-top-row">
          <div class="profile-head">
            <div class="avatar avatar-lg">${escapeHtml(currentUser.avatar)}</div>
            <div>
              <h2>${escapeHtml(currentUser.name)}</h2>
              <div class="profile-meta">${escapeHtml(currentUser.course)} • ${escapeHtml(currentUser.school)}</div>
            </div>
          </div>
          <button class="btn btn-secondary">Editar perfil</button>
        </div>

        <p class="profile-bio">${escapeHtml(currentUser.bio)}</p>

        <div class="profile-stats">
          <div><strong>${currentUser.followers}</strong><span>seguidores</span></div>
          <div><strong>${userPosts.length}</strong><span>publicações</span></div>
          <div><strong>6</strong><span>grupos</span></div>
        </div>

        <div class="meta">📍 ${escapeHtml(currentUser.province)} • ✉️ ${escapeHtml(currentUser.email)}</div>
      </div>
    </article>

    <section class="feed-list">
      ${userPosts.length ? userPosts.map((post) => `
        <article class="post-card">
          <div class="post-author">
            <div class="avatar avatar-md">${escapeHtml(currentUser.avatar)}</div>
            <div>
              <h4>${escapeHtml(currentUser.name)}</h4>
              <small>${formatTime(post.createdAt)}</small>
            </div>
          </div>
          <p class="post-body">${escapeHtml(post.content)}</p>
          ${post.image ? `<div class="post-media"><img src="${post.image}" alt="Publicação" /></div>` : ''}
        </article>
      `).join('') : `<div class="card empty-state"><p>Ainda não tens publicações. Cria a tua primeira atualização.</p></div>`}
    </section>
  `;
}

function bindFeedInteractions() {
  document.querySelectorAll('[data-like-post]').forEach((button) => {
    button.addEventListener('click', () => {
      const postId = button.getAttribute('data-like-post');
      const data = getData();
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      const post = data.posts.find((item) => item.id === postId);
      if (!post) return;

      if (post.likes.includes(currentUser.id)) {
        post.likes = post.likes.filter((userId) => userId !== currentUser.id);
      } else {
        post.likes.push(currentUser.id);
      }

      saveData(data);
      renderFeed();
    });
  });

  document.querySelectorAll('[data-delete-post]').forEach((button) => {
    button.addEventListener('click', () => {
      const postId = button.getAttribute('data-delete-post');
      const data = getData();
      data.posts = data.posts.filter((post) => post.id !== postId);
      saveData(data);
      renderFeed();
    });
  });

  document.querySelectorAll('[data-comment-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const postId = form.getAttribute('data-comment-form');
      const input = form.querySelector('input[name="comment"]');
      const currentUser = getCurrentUser();
      if (!input.value.trim() || !currentUser) return;

      const data = getData();
      const post = data.posts.find((item) => item.id === postId);
      if (!post) return;

      post.comments.push({
        id: `c${Date.now()}`,
        userId: currentUser.id,
        text: input.value.trim(),
        createdAt: new Date().toISOString()
      });

      saveData(data);
      renderFeed();
    });
  });

  document.querySelectorAll('[data-follow]').forEach((button) => {
    button.addEventListener('click', () => {
      const userId = button.getAttribute('data-follow');
      const data = getData();
      const user = data.users.find((item) => item.id === userId);
      if (!user) return;
      user.followers += 1;
      saveData(data);
      renderSuggestions();
      renderExplore();
    });
  });
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
      previewBox.innerHTML = `<img src="${e.target.result}" alt="Pré-visualização da publicação" />`;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }

    const content = document.getElementById('postContent').value.trim();
    if (!content && !imageInput.files[0]) {
      alert('Escreve algo ou selecione uma imagem antes de publicar.');
      return;
    }

    const data = getData();
    const imageValue = imageInput.files[0]
      ? (function () {
          const reader = new FileReader();
          let result = '';
          reader.onload = (e) => {
            result = e.target.result;
          };
          reader.readAsDataURL(imageInput.files[0]);
          return result;
        })()
      : '';

    const finalImage = imageValue || (previewBox.querySelector('img') ? previewBox.querySelector('img').src : '');

    data.posts.unshift({
      id: `p${Date.now()}`,
      userId: currentUser.id,
      content,
      image: finalImage,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    });

    saveData(data);
    form.reset();
    previewBox.innerHTML = '';
    previewBox.classList.add('hidden');
    renderFeed();
  });
}

function bindQuestionForm() {
  const form = document.getElementById('questionForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = document.getElementById('questionTitle').value.trim();
    const text = document.getElementById('questionText').value.trim();
    const currentUser = getCurrentUser();
    if (!title || !text || !currentUser) return;

    const data = getData();
    data.questions.unshift({
      id: `q${Date.now()}`,
      userId: currentUser.id,
      title,
      text,
      answers: 0,
      createdAt: new Date().toISOString()
    });

    saveData(data);
    form.reset();
    renderQuestions();
  });
}

function bindMessageForm() {
  const form = document.getElementById('messageForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    const input = document.getElementById('messageInput');
    if (!currentUser || !input.value.trim()) return;

    const data = getData();
    data.messages.push({
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      receiverId: 'u2',
      text: input.value.trim(),
      createdAt: new Date().toISOString()
    });

    saveData(data);
    input.value = '';
    renderMessages();
  });
}

function routePage() {
  const user = getCurrentUser();
  const page = document.body.dataset.page;

  if (page === 'feed' || page === 'explore' || page === 'questions' || page === 'videos' || page === 'groups' || page === 'messages' || page === 'profile' || page === 'settings') {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
  }

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
    case 'settings':
      updateHeaderUser();
      break;
    default:
      break;
  }

  updateHeaderUser();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  bindAuthForms();
  bindPostComposer();
  bindQuestionForm();
  bindMessageForm();
  routePage();
});
