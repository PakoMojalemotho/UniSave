/* ═══════════════════════════════════════════════
   UNISAVE — SHARED JAVASCRIPT  v2.0
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MODULE: Auth
     Centralised user session management.
     Used by: dashboard.html (Auth.get / Auth.logout),
              login.html, verify.html, nav chip.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  var Auth = {
    KEY: 'unisave_user',

    /** @returns {object|null} parsed user or null */
    get: function () {
      try { return JSON.parse(localStorage.getItem(Auth.KEY) || 'null'); }
      catch (e) { return null; }
    },

    /** @param {object} user */
    set: function (user) {
      var u = Object.assign({}, user);
      delete u.password;                          // never persist password in session
      localStorage.setItem(Auth.KEY, JSON.stringify(u));
    },

    logout: function () {
      localStorage.removeItem(Auth.KEY);
      showToast('Logged out. See you soon! 👋', 'info');
      setTimeout(function () { window.location.href = 'index.html'; }, 1200);
    }
  };
  window.Auth = Auth;

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MODULE: Savings
     Persists claimed deals so the dashboard
     can display history, totals and top-category.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  var Savings = {
    KEY: 'unisave_savings',

    getAll: function () {
      try { return JSON.parse(localStorage.getItem(Savings.KEY) || '[]'); }
      catch (e) { return []; }
    },

    /** @param {object} deal — shape from DEALS array */
    add: function (deal) {
      var all = Savings.getAll();
      var existing = all.find(function (e) { return e.id === deal.id; });
      if (existing) { showToast('Already saved! Check your dashboard.', 'info'); return; }
      all.unshift({
        id:        deal.id,
        brand:     deal.brand,
        code:      deal.code,
        discount:  deal.discount,
        category:  deal.category,
        emoji:     deal.emoji,
        location:  deal.location,
        amount:    deal.savedAmount || 0,
        savedAt:   Date.now()
      });
      localStorage.setItem(Savings.KEY, JSON.stringify(all));
    },

    /** @param {string|number} id */
    remove: function (id) {
      var all = Savings.getAll().filter(function (e) { return e.id !== id; });
      localStorage.setItem(Savings.KEY, JSON.stringify(all));
    }
  };
  window.Savings = Savings;

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MODULE: Budget
     Persists budget-matcher preferences.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  var Budget = {
    KEY: 'unisave_budget',
    get: function () {
      try { return JSON.parse(localStorage.getItem(Budget.KEY) || 'null'); }
      catch (e) { return null; }
    },
    set: function (b) {
      localStorage.setItem(Budget.KEY, JSON.stringify(b));
    }
  };
  window.Budget = Budget;

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MODULE: DealGuard
     Checks deal validity / expiry dates.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  var DealGuard = {
    /** @param {object} deal */
    isDealExpired: function (deal) {
      if (!deal.expiresAt) return false;
      return Date.now() > new Date(deal.expiresAt).getTime();
    }
  };
  window.DealGuard = DealGuard;

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DEALS DATA
     Single source of truth used by the budget
     matcher on the dashboard.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  window.DEALS = [
    { id:'cl-15off',    emoji:'🍔', brand:'Chicken Licken',  discount:'15% OFF',     location:'CBD & Game City',         code:'UNISAVE-CL15',   category:'food',      savedAmount:30,  badge:'hot' },
    { id:'steers-bogo', emoji:'🍕', brand:'Steers',          discount:'Buy 1 Get 1', location:'Riverwalk & Fairground',  code:'STEERS-BOGO',    category:'food',      savedAmount:45,  badge:'new' },
    { id:'mugg-refill', emoji:'☕', brand:'Mugg & Bean',     discount:'Free Refill', location:'Riverwalk Mall',          code:'MUGG-STUDENT',   category:'food',      savedAmount:20 },
    { id:'nandos-10',   emoji:'🥗', brand:'Nandos',          discount:'10% OFF',     location:'Game City & CBD',         code:'NANDOS-UNI10',   category:'food',      savedAmount:25 },
    { id:'subway-10',   emoji:'🥪', brand:'Subway',          discount:'P10 OFF',     location:'Riverwalk Mall',          code:'SUBWAY-UNI10',   category:'food',      savedAmount:10 },
    { id:'seabelo',     emoji:'🚌', brand:'Seabelo Transport',discount:'P2 OFF',     location:'All Gaborone routes',     code:'SEABELO-UNI',    category:'transport', savedAmount:40,  badge:'hot' },
    { id:'indrive',     emoji:'🚕', brand:'InDrive',         discount:'20% OFF',     location:'Gaborone & Francistown',  code:'INDRIVE-STU20',  category:'transport', savedAmount:30 },
    { id:'edgars-15',   emoji:'👗', brand:'Edgars',          discount:'15% OFF',     location:'Game City',               code:'EDGARS-UNI15',   category:'retail',    savedAmount:80 },
    { id:'bookworld',   emoji:'📚', brand:'Bookworld',       discount:'10% OFF',     location:'Game City',               code:'BOOKWORLD10',    category:'retail',    savedAmount:40 },
    { id:'itech-5',     emoji:'🖥️', brand:'ITech Botswana',  discount:'5% OFF',      location:'CBD & Fairground',        code:'ITECH-UNI5',     category:'retail',    savedAmount:100, badge:'exc' },
    { id:'mascom',      emoji:'📱', brand:'Mascom',          discount:'20% Bonus',   location:'All Mascom outlets',      code:'MASCOM-UNI20',   category:'airtime',   savedAmount:30,  badge:'exc' },
    { id:'orange-dbl',  emoji:'📶', brand:'Orange Botswana', discount:'Double Data', location:'All Orange shops',        code:'ORANGE-DBL',     category:'airtime',   savedAmount:50 },
    { id:'printsmart',  emoji:'🖨️', brand:'PrintSmart',      discount:'10 Pages Free',location:'UB Campus & CBD',        code:'PRINT-FREE10',   category:'printing',  savedAmount:15,  badge:'free' },
    { id:'copyking',    emoji:'📋', brand:'CopyKing',        discount:'30% OFF',     location:'UB & BIUST areas',        code:'COPYKING30',     category:'printing',  savedAmount:25 },
    { id:'bonprix',     emoji:'💊', brand:'BonPrix Pharmacy',discount:'10% OFF',     location:'Gaborone CBD',            code:'BONPRIX10',      category:'health',    savedAmount:20 },
    { id:'fitzone',     emoji:'🏋️', brand:'FitZone Gym',     discount:'30% OFF',     location:'Block 6, Gaborone',       code:'FITZONE-STU30',  category:'fitness',   savedAmount:90,  badge:'new' },
    { id:'hairhub',     emoji:'✂️', brand:'Hair Hub',        discount:'20% OFF',     location:'Gaborone West',           code:'HAIRHUB20',      category:'beauty',    savedAmount:30 },
    { id:'glowup',      emoji:'💅', brand:'GlowUp Salon',    discount:'P30 OFF',     location:'Phase 2, Gaborone',       code:'GLOWUP-STU',     category:'beauty',    savedAmount:30 }
  ];

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MOBILE NAV
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initMobileNav() {
    var hamburger = document.querySelector('.nav-hamburger');
    if (!hamburger) return;

    if (!document.querySelector('.mobile-nav')) {
      var currentPage = location.pathname.split('/').pop() || 'index.html';
      var links = [
        ['index.html',      'Home'],
        ['deals.html',      'Deals'],
        ['categories.html', 'Categories'],
        ['businesses.html', 'For Businesses'],
        ['verify.html',     'Join Free']
      ];
      var nav = document.createElement('div');
      nav.className = 'mobile-nav';
      nav.innerHTML =
        '<div class="mobile-nav-panel">' +
        links.map(function (l) {
          return '<a href="' + l[0] + '" class="' + (l[0] === currentPage ? 'active' : '') + '">' + l[1] + '</a>';
        }).join('') +
        '<div class="mobile-nav-btns">' +
        '<a href="login.html" class="btn btn-ghost">Log in</a>' +
        '<a href="verify.html" class="btn btn-primary">Get Verified</a>' +
        '</div></div>';
      document.body.appendChild(nav);
      nav.addEventListener('click', function (e) { if (e.target === nav) closeNav(); });
    }

    var mobileNav = document.querySelector('.mobile-nav');

    function openNav() {
      mobileNav.style.display = 'block';
      requestAnimationFrame(function () { mobileNav.classList.add('open'); });
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('aria-expanded', 'true');
    }
    function closeNav() {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
      setTimeout(function () { if (!mobileNav.classList.contains('open')) mobileNav.style.display = ''; }, 300);
    }

    hamburger.addEventListener('click', function () {
      mobileNav.classList.contains('open') ? closeNav() : openNav();
    });
    mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TOAST
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  var toastTimer;
  window.showToast = function (msg, type) {
    var toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = 'toast' + (type ? ' ' + type : '');
    requestAnimationFrame(function () { toast.classList.add('show'); });
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3500);
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DEAL MODAL
     Opens when a .deal-cta[data-code] is clicked.
     If user is not logged in, shows a gated prompt.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  window.openModal = function (code, dealId) {
    var overlay = document.getElementById('deal-modal');
    var display = document.getElementById('modal-code-display');
    if (!overlay) return;

    var user = Auth.get();

    // If logged-in, reveal real code and optionally save the deal
    if (user) {
      if (display) display.textContent = code || 'UNISAVE';

      // Swap the CTA button to "Save to my deals"
      var modalCta = overlay.querySelector('.modal-cta-btn');
      if (!modalCta) {
        modalCta = overlay.querySelector('a[href="verify.html"]');
        if (modalCta) {
          modalCta.className = 'btn btn-primary modal-cta-btn';
          modalCta.removeAttribute('href');
          modalCta.style.width = '100%';
          modalCta.style.justifyContent = 'center';
        }
      }
      if (modalCta) {
        modalCta.textContent = '💾 Save deal to my profile';
        modalCta.onclick = function (e) {
          e.preventDefault();
          if (dealId) {
            var deal = window.DEALS.find(function (d) { return d.id === dealId; });
            if (deal) { Savings.add(deal); showToast('Deal saved! View it in your dashboard 🎉', 'success'); }
          }
          overlay.classList.remove('open');
        };
      }
    } else {
      // Show a redacted code to guests
      if (display) display.textContent = '••••••••';
      var guestCta = overlay.querySelector('.modal-cta-btn') || overlay.querySelector('a[href="verify.html"]');
      if (guestCta) {
        guestCta.className = 'btn btn-primary modal-cta-btn';
        guestCta.textContent = 'Verify to unlock this deal →';
        guestCta.href = 'verify.html';
        guestCta.onclick = null;
      }
    }

    overlay.classList.add('open');
  };

  function closeModal() {
    var overlay = document.getElementById('deal-modal');
    if (overlay) overlay.classList.remove('open');
  }

  // Close modal on backdrop click or ✕ button
  document.addEventListener('click', function (e) {
    if (e.target.id === 'modal-close-btn' || e.target.closest('#modal-close-btn')) {
      closeModal(); return;
    }
    var overlay = e.target.closest('.modal-overlay');
    if (overlay && e.target === overlay) closeModal();
  });

  // Copy code on click
  document.addEventListener('click', function (e) {
    if (e.target.id === 'modal-code-display') {
      var text = e.target.textContent;
      if (text.includes('•')) { showToast('Verify your student status to unlock this code.', 'info'); return; }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { showToast('Code copied! ✓', 'success'); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Code copied! ✓', 'success');
      }
    }
  });

  // Delegate all .deal-cta[data-code] clicks
  document.addEventListener('click', function (e) {
    var cta = e.target.closest('.deal-cta[data-code]');
    if (!cta) return;
    e.preventDefault();
    var code   = cta.dataset.code;
    var dealId = cta.dataset.dealId || null;
    // Try to infer dealId from DEALS if not explicit
    if (!dealId) {
      var match = window.DEALS.find(function (d) { return d.code === code; });
      if (match) dealId = match.id;
    }
    openModal(code, dealId);
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DEAL FILTER (deals page)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initDealFilter() {
    var pills = document.querySelectorAll('.cat-pill[data-filter]');
    var grid  = document.getElementById('deals-grid');
    var count = document.getElementById('deals-shown');
    if (!pills.length || !grid) return;

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        this.classList.add('active');
        var filter = this.dataset.filter;

        var cards = grid.querySelectorAll('.deal-card');
        var shown = 0;
        cards.forEach(function (card) {
          var show = filter === 'all' || card.dataset.category === filter;
          card.style.display = show ? '' : 'none';
          if (show) shown++;
        });
        if (count) count.textContent = shown;

        var empty = document.getElementById('empty-state');
        if (empty) empty.style.display = shown === 0 ? 'block' : 'none';
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DEAL SEARCH
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initDealSearch() {
    var input = document.getElementById('deal-search');
    var grid  = document.getElementById('deals-grid');
    var count = document.getElementById('deals-shown');
    if (!input || !grid) return;

    input.addEventListener('input', function () {
      var q = this.value.toLowerCase().trim();
      var cards = grid.querySelectorAll('.deal-card');
      var shown = 0;
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var show = !q || text.includes(q);
        card.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (count) count.textContent = shown;
      var empty = document.getElementById('empty-state');
      if (empty) empty.style.display = shown === 0 ? 'block' : 'none';

      // Reset category pills
      document.querySelectorAll('.cat-pill').forEach(function (p) { p.classList.remove('active'); });
      var allPill = document.querySelector('.cat-pill[data-filter="all"]');
      if (allPill) allPill.classList.add('active');
    });

    // Honour URL query params: ?q=... or ?cat=...
    var params = new URLSearchParams(location.search);
    var q = params.get('q');
    var cat = params.get('cat');
    if (q)   { input.value = q; input.dispatchEvent(new Event('input')); }
    if (cat) { var pill = document.querySelector('.cat-pill[data-filter="' + cat + '"]'); if (pill) pill.click(); }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     HERO SEARCH (index.html)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initHeroSearch() {
    var input = document.getElementById('hero-search');
    if (!input) return;
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && this.value.trim()) {
        location.href = 'deals.html?q=' + encodeURIComponent(this.value.trim());
      }
    });
    // Also support any nearby search button
    var btn = input.closest('.search-bar') && input.closest('.search-bar').querySelector('button');
    if (btn) {
      btn.addEventListener('click', function () {
        if (input.value.trim()) location.href = 'deals.html?q=' + encodeURIComponent(input.value.trim());
      });
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     COUNT-UP ANIMATION
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initCountUp() {
    var els = document.querySelectorAll('[data-countup]');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el     = entry.target;
        var target = parseInt(el.dataset.countup, 10);
        var prefix = el.dataset.prefix || '';
        var suffix = el.dataset.suffix || '';
        var current = 0;
        var step    = Math.max(1, Math.ceil(target / 80));
        var timer = setInterval(function () {
          current = Math.min(current + step, target);
          el.textContent = prefix + current.toLocaleString() + suffix;
          if (current >= target) clearInterval(timer);
        }, 20);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SCROLL REVEAL
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.08 });
    els.forEach(function (el) {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      obs.observe(el);
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ACTIVE NAV LINK
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function highlightNav() {
    var page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === page);
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     AUTH NAV CHIP
     Replaces the Login/Verify buttons with a
     user avatar chip + dropdown when logged in.
     Skips replacement on dashboard.html (it has
     its own full nav), but still shows the chip.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initAuthNav() {
    var user = Auth.get();
    if (!user) return;

    var actions = document.querySelector('.nav-actions');
    if (!actions) return;

    var initials  = user.name
      ? user.name.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2)
      : '?';
    var firstName = user.name ? user.name.split(' ')[0] : 'Me';

    actions.innerHTML =
      '<div id="nav-user-chip" style="display:flex;align-items:center;gap:8px;padding:5px 14px 5px 5px;border-radius:999px;border:1.5px solid var(--border);background:var(--surface);cursor:pointer;">' +
        '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#16a34a,#22c55e);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:900;color:#fff;font-family:Fraunces,serif;">' + initials + '</div>' +
        '<span style="font-size:0.82rem;font-weight:700;color:var(--text);">' + firstName + '</span>' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</div>' +
      '<div id="nav-user-dd" style="position:fixed;top:var(--nav-h);right:1.5rem;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);min-width:180px;z-index:1100;overflow:hidden;opacity:0;pointer-events:none;transform:translateY(-8px);transition:opacity 0.2s,transform 0.2s;">' +
        '<a href="dashboard.html" style="display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:0.84rem;font-weight:600;color:var(--text);border-bottom:1px solid var(--border);">📊 Dashboard</a>' +
        '<button onclick="Auth.logout()" style="display:flex;align-items:center;gap:10px;width:100%;padding:12px 16px;font-size:0.84rem;font-weight:600;color:var(--red,#dc2626);background:none;border:none;cursor:pointer;font-family:Plus Jakarta Sans,sans-serif;">🚪 Log out</button>' +
      '</div>';

    var chip = document.getElementById('nav-user-chip');
    var dd   = document.getElementById('nav-user-dd');

    chip.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dd.style.opacity === '1';
      dd.style.opacity       = open ? '0' : '1';
      dd.style.pointerEvents = open ? 'none' : 'all';
      dd.style.transform     = open ? 'translateY(-8px)' : 'translateY(0)';
    });

    document.addEventListener('click', function () {
      if (dd) { dd.style.opacity = '0'; dd.style.pointerEvents = 'none'; dd.style.transform = 'translateY(-8px)'; }
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SAVE DEAL TO PROFILE (public helper)
     Called from deal cards with onclick=
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  window.saveDealToProfile = function (dealIdOrBrand) {
    var user = Auth.get();
    if (!user) { window.location.href = 'login.html?next=' + encodeURIComponent(location.pathname); return; }
    var deal = window.DEALS.find(function (d) { return d.id === dealIdOrBrand || d.brand === dealIdOrBrand; });
    if (deal) {
      Savings.add(deal);
      showToast('Deal saved! ❤️ View in your dashboard.', 'success');
    }
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     LEGACY COMPAT: __logout / logoutUser
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  window.__logout    = function () { Auth.logout(); };
  window.logoutUser  = function () { Auth.logout(); };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BUSINESS ENQUIRY FORM
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  window.submitBiz = function () {
    showToast("Enquiry submitted! We'll contact you within 24 hours. 🎉", 'success');
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DEALS PAGE: sort select
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initSortSelect() {
    var sel  = document.querySelector('.filter-select');
    var grid = document.getElementById('deals-grid');
    if (!sel || !grid) return;

    sel.addEventListener('change', function () {
      var cards = Array.from(grid.querySelectorAll('.deal-card'));
      // Detach for sorting
      cards.forEach(function (c) { grid.removeChild(c); });

      switch (sel.value) {
        case 'Biggest Discount':
          cards.sort(function (a, b) {
            // Extract numeric discount from text (e.g. "15% OFF" → 15, "P30 OFF" → 30)
            var numA = parseInt((a.querySelector('.deal-discount') || {textContent:''}).textContent.replace(/[^0-9]/g,''), 10) || 0;
            var numB = parseInt((b.querySelector('.deal-discount') || {textContent:''}).textContent.replace(/[^0-9]/g,''), 10) || 0;
            return numB - numA;
          });
          break;
        case 'Newest':
          // Hot/New badges first
          cards.sort(function (a, b) {
            var bA = a.querySelector('.badge-new') ? 1 : (a.querySelector('.badge-hot') ? 0.5 : 0);
            var bB = b.querySelector('.badge-new') ? 1 : (b.querySelector('.badge-hot') ? 0.5 : 0);
            return bB - bA;
          });
          break;
        default:
          // Featured — Exclusive badges first, then Hot, then rest
          cards.sort(function (a, b) {
            var score = function (c) {
              if (c.querySelector('.badge-exc'))  return 3;
              if (c.querySelector('.badge-hot'))  return 2;
              if (c.querySelector('.badge-new'))  return 1;
              if (c.querySelector('.badge-free')) return 1;
              return 0;
            };
            return score(b) - score(a);
          });
      }

      cards.forEach(function (c) { grid.appendChild(c); });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     INIT 
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initDealFilter();
    initDealSearch();
    initHeroSearch();
    initCountUp();
    initReveal();
    highlightNav();
    initAuthNav();
    initSortSelect();
  });

})();
