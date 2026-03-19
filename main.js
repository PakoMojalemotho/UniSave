// =============================================
//  UniSave — Botswana Student Deals Platform
//  Global JavaScript
// =============================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- Active nav link ----
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  // ---- Mobile hamburger ----
  var hamburger = document.querySelector('.nav-hamburger');
  var navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Scroll reveal ----
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('revealed'); });
    }
  }

  // ---- Category filter pills ----
  var pills     = document.querySelectorAll('.cat-pill[data-filter]');
  var dealCards = document.querySelectorAll('.deal-card[data-category]');
  if (pills.length && dealCards.length) {
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var filter = pill.getAttribute('data-filter');
        dealCards.forEach(function (card) {
          card.style.display = (filter === 'all' || card.getAttribute('data-category') === filter) ? '' : 'none';
        });
        updateDealCount();
      });
    });
  }

  // ---- Search ----
  var searchInput = document.querySelector('#deal-search');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = this.value.toLowerCase().trim();
      document.querySelectorAll('.deal-card').forEach(function (card) {
        card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
      updateDealCount();
    });
  }

  // ---- Deal count ----
  function updateDealCount() {
    var countEl = document.getElementById('deals-shown');
    if (!countEl) return;
    var shown = 0;
    document.querySelectorAll('.deal-card').forEach(function (c) { if (c.style.display !== 'none') shown++; });
    countEl.textContent = shown;
    var empty = document.getElementById('empty-state');
    if (empty) empty.style.display = shown === 0 ? 'block' : 'none';
  }

  // ---- Deal modal ----
  var modal       = document.getElementById('deal-modal');
  var codeDisplay = document.getElementById('modal-code-display');
  if (modal && codeDisplay) {
    document.querySelectorAll('.deal-cta[data-code]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        codeDisplay.textContent = this.getAttribute('data-code');
        modal.classList.add('open');
      });
    });
    document.getElementById('modal-close-btn').addEventListener('click', function () {
      modal.classList.remove('open');
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') modal.classList.remove('open');
    });
    codeDisplay.addEventListener('click', function () {
      var code = this.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(function () {
          codeDisplay.textContent = '✓ Copied!';
          setTimeout(function () { codeDisplay.textContent = code; }, 1600);
        });
      }
    });
  }

  // ---- Count-up animation ----
  var countEls = document.querySelectorAll('[data-countup]');
  if (countEls.length && window.IntersectionObserver) {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cIO.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { cIO.observe(el); });
  }

  function animateCount(el) {
    var target    = parseFloat(el.getAttribute('data-countup'));
    var suffix    = el.getAttribute('data-suffix') || '';
    var prefix    = el.getAttribute('data-prefix') || '';
    var steps     = 50;
    var increment = target / steps;
    var current   = 0;
    var timer = setInterval(function () {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
    }, 1200 / steps);
  }

  // ---- URL param pre-fill search ----
  var params = new URLSearchParams(window.location.search);
  if (params.get('q') && searchInput) {
    searchInput.value = params.get('q');
    searchInput.dispatchEvent(new Event('input'));
  }
  if (params.get('cat')) {
    var targetPill = document.querySelector('.cat-pill[data-filter="' + params.get('cat') + '"]');
    if (targetPill) targetPill.click();
  }

});

// ---- Global toast ----
window.showToast = function (msg, type) {
  type = type || 'info';
  document.querySelectorAll('.toast').forEach(function (t) { t.remove(); });
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { t.classList.add('show'); });
  });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { t.remove(); }, 320);
  }, 3000);
};
