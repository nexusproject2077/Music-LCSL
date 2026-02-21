/* ============================================
   VIBE – Authentication Module
   ============================================ */

const Auth = {
  /* ── Show/hide forms ── */
  showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
  },
  showRegister() {
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
    // Set up password strength meter
    const pwd = document.getElementById('register-password');
    if (pwd) pwd.addEventListener('input', () => Auth._checkStrength(pwd.value));
  },

  /* ── Login ── */
  login() {
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;
    if (!email || !pass) {
      return UI.toast('Remplis tous les champs', 'error');
    }
    const user = Store.findUser(email);
    if (!user) {
      return UI.toast('Aucun compte trouvé pour cet email', 'error');
    }
    if (user.password !== Auth._hashSimple(pass)) {
      return UI.toast('Mot de passe incorrect', 'error');
    }
    Auth._startSession(user);
  },

  /* ── Demo login (Google simulation) ── */
  loginDemo() {
    const demo = {
      id:       'demo_user',
      name:     'Demo User',
      email:    'demo@vibe.music',
      avatar:   null,
      joinedAt: Date.now(),
    };
    // Save if not exists
    if (!Store.findUser(demo.email)) {
      Store.saveUser(demo.email, { ...demo, password: Auth._hashSimple('demo') });
    }
    Auth._startSession(demo);
  },

  /* ── Register ── */
  register() {
    const name  = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const pass  = document.getElementById('register-password').value;

    if (!name || !email || !pass) {
      return UI.toast('Remplis tous les champs', 'error');
    }
    if (!Auth._validEmail(email)) {
      return UI.toast('Email invalide', 'error');
    }
    if (pass.length < 6) {
      return UI.toast('Le mot de passe doit faire au moins 6 caractères', 'error');
    }
    if (Store.findUser(email)) {
      return UI.toast('Un compte existe déjà avec cet email', 'error');
    }

    const user = {
      id:       'u_' + Date.now(),
      name,
      email,
      password: Auth._hashSimple(pass),
      avatar:   null,
      joinedAt: Date.now(),
    };
    Store.saveUser(email, user);
    Auth._startSession(user);
    UI.toast(`Bienvenue sur VIBE, ${name} !`, 'success');
  },

  /* ── Start session ── */
  _startSession(user) {
    const sessionUser = { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
    Store.setUser(sessionUser);
    Auth._applyUserToUI(sessionUser);
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    Router.navigate('home');
    UI.toast(`Bienvenue, ${user.name} !`, 'success');
  },

  /* ── Logout ── */
  logout() {
    Store.clearUser();
    document.getElementById('app').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    Auth.showLogin();
    document.getElementById('user-dropdown').classList.add('hidden');
    Player.stop();
    UI.toast('À bientôt !', 'info');
  },

  /* ── Apply user info to UI ── */
  _applyUserToUI(user) {
    const nameEl   = document.getElementById('user-display-name');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) {
      if (user.avatar) {
        avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
      } else {
        avatarEl.textContent = user.name.charAt(0).toUpperCase();
      }
    }
  },

  /* ── Check existing session ── */
  checkSession() {
    const user = Store.getUser();
    if (user) {
      Auth._applyUserToUI(user);
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      return true;
    }
    return false;
  },

  /* ── Password strength ── */
  _checkStrength(pass) {
    const fill  = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');
    if (!fill || !label) return;
    let score = 0;
    if (pass.length >= 6)  score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const levels = [
      { pct: '20%', color: '#ef4444', text: 'Très faible' },
      { pct: '40%', color: '#f97316', text: 'Faible' },
      { pct: '60%', color: '#eab308', text: 'Moyen' },
      { pct: '80%', color: '#22c55e', text: 'Fort' },
      { pct: '100%', color: '#10b981', text: 'Excellent' },
    ];
    const lvl = levels[Math.min(score - 1, 4)] || { pct: '0%', color: '', text: 'Trop court' };
    fill.style.width = lvl.pct;
    fill.style.background = lvl.color;
    label.textContent = lvl.text;
    label.style.color = lvl.color;
  },

  /* ── Helpers ── */
  _validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); },

  // Simple (non-secure) hash for demo — in production use bcrypt on server
  _hashSimple(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return 'h_' + Math.abs(h).toString(36);
  },

  /* ── Update profile ── */
  updateProfile(updates) {
    const user = Store.getUser();
    if (!user) return;
    const updated = { ...user, ...updates };
    Store.setUser(updated);
    // Also update in users store
    const storedUser = Store.findUser(user.email);
    if (storedUser) Store.saveUser(user.email, { ...storedUser, ...updates });
    Auth._applyUserToUI(updated);
    return updated;
  },
};
