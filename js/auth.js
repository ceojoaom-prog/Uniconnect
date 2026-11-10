const passwordInput = document.getElementById('password');
const togglePasswordButton = document.querySelector('.toggle-password');

if (passwordInput && togglePasswordButton) {
  togglePasswordButton.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordButton.textContent = isPassword ? 'Ocultar' : 'Mostrar';
    togglePasswordButton.setAttribute('aria-label', isPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe');
  });
}
