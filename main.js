/* =========================================================
   СЕМЕЙСКИЙ ССЗ — СКРИПТЫ
   0.  Анимация открытия сайта (каскадное появление шапки и героя)
   0b. Прогресс-бар прокрутки страницы
   1.  Шапка: смена фона при скролле
   2.  Мобильное меню (+ 2b подменю «Проекты» на мобильных)
   3.  Клик по ссылкам меню закрывает мобильную навигацию
   4.  Ripple-эффект на кнопках
   5.  Появление блоков при скролле (reveal + каскад)
   5b. Счётчики-цифры
   5c. Подсветка активного пункта меню (scrollspy)
   6.  Форма обратной связи (заглушка отправки)
   7.  Лёгкий параллакс героя
   8.  Год в футере
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 0. Анимация открытия сайта ---------- */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('page-ready');
    });
  });

  /* ---------- 0b. Прогресс-бар прокрутки страницы ---------- */
  const progressBar = document.getElementById('scroll-progress');
  const updateProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (progressBar) progressBar.style.transform = 'scaleX(' + ratio + ')';
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ---------- 1. Шапка при скролле ---------- */
  const header = document.getElementById('site-header');
  const toggleHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  toggleHeaderState();
  window.addEventListener('scroll', toggleHeaderState, { passive: true });

  /* ---------- 2. Мобильное меню ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  const closeNav = () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  /* ---------- 3. Клик по ссылкам меню закрывает мобильную навигацию ---------- */
  document.querySelectorAll('.main-nav a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  /* ---------- 4. Ripple-эффект на кнопках ---------- */
  document.querySelectorAll('[data-ripple]').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');

      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---------- 5. Появление блоков при скролле (reveal + каскад) ---------- */
  // Каскадная задержка для элементов внутри сеток (карточки, статистика, контакты)
  document.querySelectorAll('.cards-grid, .stats, .contact-list, .process').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--reveal-delay', (i * 0.08).toFixed(2) + 's');
    });
  });

  const revealTargets = document.querySelectorAll(
    '.section .eyebrow, .section h2, .section-lead, .about-copy, .timeline-item, ' +
    '.stat, .service-card, .project-card, .contact-list li, .placeholder-note, ' +
    '.map-embed, .feedback-lead, .feedback-form'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 5b. Счётчики-цифры (раздел «О нас») ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (prefersReduced) { el.textContent = String(target); return; }
    const duration = 1400;
    let startTime = null;
    const step = (ts) => {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => countObserver.observe(el));
  }

  /* ---------- 5c. Подсветка активного пункта меню (scrollspy) ---------- */
  const spySections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window && spySections.length) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const link = document.querySelector('.main-nav a[href="#' + entry.target.id + '"]');
          if (!link) return;
          document.querySelectorAll('.main-nav a.is-active').forEach((a) => a.classList.remove('is-active'));
          link.classList.add('is-active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    spySections.forEach((s) => spyObserver.observe(s));
  }

  /* ---------- 6. Форма обратной связи ---------- */
  const form = document.getElementById('feedback-form');
  const status = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const contact = form.contact.value.trim();

      if (!name || !contact) {
        status.textContent = 'Заполните имя и контакт для связи.';
        status.style.color = '#B26A43';
        return;
      }

      // ЗАГЛУШКА: здесь нужно подключить реальную отправку (fetch на backend / почтовый сервис).
      status.style.color = '';
      status.textContent = 'Спасибо! Заявка сформирована — подключите отправку на backend, чтобы она уходила на почту.';
      form.reset();
    });
  }

  /* ---------- 7. Лёгкий параллакс героя ---------- */
  if (!prefersReduced) {
    const heroInner = document.querySelector('.hero-inner');
    if (heroInner) {
      const onHeroScroll = () => {
        const y = window.scrollY;
        if (y > window.innerHeight) return; // работаем, только пока герой на экране
        heroInner.style.transform = 'translateY(' + (y * 0.12).toFixed(1) + 'px)';
        heroInner.style.opacity = String(Math.max(1 - y / 620, 0));
      };
      window.addEventListener('scroll', onHeroScroll, { passive: true });
    }
  }

  /* ---------- 8. Год в футере ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
