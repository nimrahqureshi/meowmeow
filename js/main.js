/* ============================
   MAIN.JS — GLOBAL UTILITIES ONLY
   ============================ */

// ===== TOAST SYSTEM (GLOBAL) =====
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  // Auto-remove after 4s
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 300);
    }
  }, 4000);
};

// ===== CONSOLE BRANDING =====
console.log(
  '%c🐱 MeowMeow %c v1.0 ',
  'background: linear-gradient(135deg, #7C3AED, #F472B6); color: white; font-size: 18px; font-weight: bold; padding: 8px 12px; border-radius: 8px 0 0 8px;',
  'background: #1e293b; color: #f1f5f9; font-size: 14px; padding: 8px 12px; border-radius: 0 8px 8px 0;'
);
console.log('%cBuilt with ❤️ for pet lovers everywhere!', 'color: #7C3AED; font-size: 12px;');