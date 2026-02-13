// Кастомный курсор в стиле 2000-х
(function () {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Плавное следование курсора
  function animateCursor() {
    const speed = 0.2;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Увеличивать звёздочку на ссылках и кнопках
  const hoverTargets = document.querySelectorAll('a, button, .btn, .nav a, .project-card');
  hoverTargets.forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      cursor.classList.add('hover');
    });
    el.addEventListener('mouseleave', function () {
      cursor.classList.remove('hover');
    });
  });

  // Скрыть свой курсор, если мышь ушла с окна
  document.addEventListener('mouseleave', function () {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    cursor.style.opacity = '1';
  });
})();
