// Отправка формы обратной связи на сервер и сохранение в БД
(function () {
  var form = document.getElementById('feedback-form');
  var messageEl = document.getElementById('form-message');
  var submitBtn = form && form.querySelector('.btn-submit');

  if (!form || !messageEl) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = (form.name && form.name.value || '').trim();
    var email = (form.email && form.email.value || '').trim();
    var message = (form.message && form.message.value || '').trim();

    if (!name || !email || !message) {
      showMessage('Заполните все обязательные поля (имя, e-mail, сообщение).', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
    }
    messageEl.textContent = '';
    messageEl.className = 'form-message';

    var payload = {
      name: name,
      email: email,
      phone: (form.phone && form.phone.value || '').trim(),
      type: (form.type && form.type.value) || 'other',
      message: message,
    };

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            showMessage(data.message || 'Заявка отправлена! Спасибо.', 'success');
            form.reset();
          } else {
            showMessage(data.error || 'Ошибка отправки. Попробуйте ещё раз.', 'error');
          }
        });
      })
      .catch(function () {
        showMessage('Сервер недоступен. Запустите сервер: npm start', 'error');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Отправить заявку →';
        }
      });
  });

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'form-message ' + (type === 'success' ? 'success' : 'error');
  }
})();
