// Открытие и закрытие поп-апов проектов
(function () {
  var openButtons = document.querySelectorAll('.btn-open-popup');
  var overlays = document.querySelectorAll('.popup-overlay');

  function openPopup(id) {
    var popup = document.getElementById(id);
    if (popup) {
      popup.classList.add('is-open');
      popup.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closePopup(popupEl) {
    if (!popupEl) return;
    popupEl.classList.remove('is-open');
    popupEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function closeAllPopups() {
    overlays.forEach(function (el) {
      closePopup(el);
    });
  }

  // Открытие по кнопке «Посмотреть»
  openButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var id = btn.getAttribute('data-popup');
      if (id) openPopup(id);
    });
  });

  // Закрытие по кнопке «✕»
  document.querySelectorAll('.popup-close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var overlay = btn.closest('.popup-overlay');
      closePopup(overlay);
    });
  });

  // Закрытие по клику на затемнённый фон (оверлей)
  overlays.forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePopup(overlay);
    });
  });

  // Закрытие по Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllPopups();
  });
})();
