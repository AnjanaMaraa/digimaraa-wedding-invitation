/* ==========================================================================
   Palaniakash & Bharu — Wedding Invitation
   Vanilla JS. No libraries, no dependencies, no build step.

   CONTENTS
   01. Configuration (edit these values — nothing else)
   02. Utilities
   03. Header & navigation
   04. Scroll reveal
   05. Hero particles
   06. Countdown
   07. Copy discount code
   08. Shuttle modal
   09. RSVP
   10. Image fallbacks
   11. Boot
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     01. CONFIGURATION
     ----------------------------------------------------------------------
     Change the values below — no other file needs to be touched.
     ====================================================================== */

  /* Wedding ceremony: 30 November 2026 at 10:00 AM, in the event's local time.
     If the venue is in India (IST, UTC+05:30) keep the value below. */
  var WEDDING_DATE = { year: 2026, month: 10, day: 30, hour: 10, minute: 0, second: 0 };
  var WEDDING_UTC_OFFSET_HOURS = 5.5;

  /* "Get Directions" target. Any Google Maps search URL works. */
  var venueMapUrl =
    'https://www.google.com/maps/search/?api=1&query=The+Grand+Palace+Hall%2C+Abc+road%2C+xyz+city%2C+123456';

  /* RSVP backend.
     Leave empty ("") for demo mode: the response is validated in the browser
     and confirmed on screen, but nothing is uploaded anywhere.
     Set a URL (e.g. 'https://example.com/api/rsvp') to POST the response.
     Never place API keys or secrets in this file. */
  var RSVP_ENDPOINT = '';

  var RSVP_ENDPOINT_NOTE_DEMO =
    'Your response is saved on this device only — no information is sent to a server.';
  var RSVP_ENDPOINT_NOTE_LIVE =
    'Your response will be sent securely to Palaniakash and Bharu.';

  /* ======================================================================
     02. UTILITIES
     ====================================================================== */

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var reduceMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function prefersReducedMotion() {
    return !!(reduceMotionQuery && reduceMotionQuery.matches);
  }

  function pad(value) { return value < 10 ? '0' + value : String(value); }

  function weddingTimestamp() {
    return Date.UTC(
      WEDDING_DATE.year,
      WEDDING_DATE.month,
      WEDDING_DATE.day,
      WEDDING_DATE.hour,
      WEDDING_DATE.minute,
      WEDDING_DATE.second || 0
    ) - WEDDING_UTC_OFFSET_HOURS * 3600000;
  }

  function applyMotionPreference() {
    document.documentElement.classList.toggle('reduce-motion', prefersReducedMotion());
    document.documentElement.style.scrollBehavior = prefersReducedMotion() ? 'auto' : '';
  }

  /* ======================================================================
     03. HEADER & NAVIGATION
     ====================================================================== */

  function initHeader() {
    var header = $('#siteHeader');
    if (!header) { return; }
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initNav() {
    var toggle = $('#navToggle');
    var nav = $('#primaryNav');
    if (!toggle || !nav) { return; }

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
      var label = $('.sr-only', toggle);
      if (label) { label.textContent = open ? 'Close navigation menu' : 'Open navigation menu'; }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) { setOpen(false); }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    var desktop = window.matchMedia('(min-width: 992px)');
    var onChange = function (e) { if (e.matches) { setOpen(false); } };
    if (desktop.addEventListener) { desktop.addEventListener('change', onChange); }
    else if (desktop.addListener) { desktop.addListener(onChange); }
  }

  /* In-page anchor scrolling.
     Native `scroll-behavior: smooth` handles most of this, but doing it here
     guarantees correct behaviour in every browser, lets us offset the fixed
     header, and lets us honour prefers-reduced-motion precisely. */
  function initSmoothScroll() {
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented) { return; }
      if (event.button !== 0) { return; }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { return; }

      var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
      if (!link) { return; }
      if (link.hasAttribute('download') || link.target) { return; }

      var id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) { return; }

      var target = document.getElementById(id.slice(1));
      if (!target) { return; }

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });

      /* Keep the URL shareable without triggering a second jump. */
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', id);
      }
      /* Move keyboard focus to the destination for screen-reader users. */
      var hadTabIndex = target.hasAttribute('tabindex');
      if (!hadTabIndex) { target.setAttribute('tabindex', '-1'); }
      target.focus({ preventScroll: true });
      if (!hadTabIndex) {
        target.addEventListener('blur', function handler() {
          target.removeAttribute('tabindex');
          target.removeEventListener('blur', handler);
        });
      }
    });
  }

  function initActiveNav() {    if (!('IntersectionObserver' in window)) { return; }
    var links = $$('.nav__link');
    if (!links.length) { return; }

    var map = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href');
      if (id && id.charAt(0) === '#' && id.length > 1) { map[id.slice(1)] = link; }
    });

    var sections = Object.keys(map)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!sections.length) { return; }

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });

      var activeId = null;
      sections.forEach(function (section) {
        if (visible[section.id]) { activeId = section.id; }
      });

      links.forEach(function (link) { link.removeAttribute('aria-current'); });
      if (activeId && map[activeId]) { map[activeId].setAttribute('aria-current', 'true'); }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ======================================================================
     04. SCROLL REVEAL
     ====================================================================== */

  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) { return; }

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ======================================================================
     05. HERO PARTICLES  (a small, fixed number — 14 elements total)
     ====================================================================== */

  function initParticles() {
    var host = $('[data-particles]');
    if (!host || prefersReducedMotion()) { return; }

    var count = Math.min(parseInt(host.getAttribute('data-particles'), 10) || 12, 20);
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var span = document.createElement('span');
      span.className = 'particle';
      span.style.setProperty('--x', (4 + (i * 7.3) % 92).toFixed(2) + '%');
      span.style.setProperty('--y', (18 + (i * 13.7) % 74).toFixed(2) + '%');
      span.style.setProperty('--s', (2 + (i % 4) * 1.3).toFixed(1) + 'px');
      span.style.setProperty('--dur-cycle', (5.5 + (i % 5) * 1.4).toFixed(2) + 's');
      span.style.setProperty('--delay', ((i % 6) * 0.85).toFixed(2) + 's');
      fragment.appendChild(span);
    }
    host.appendChild(fragment);
  }

  /* ======================================================================
     06. COUNTDOWN
     ====================================================================== */

  function initCountdown() {
    var root = $('[data-countdown]');
    if (!root) { return; }

    var grid = $('[data-countdown-grid]', root);
    var done = $('[data-countdown-done]', root);
    var fields = {
      days: $('[data-cd="days"]', root),
      hours: $('[data-cd="hours"]', root),
      minutes: $('[data-cd="minutes"]', root),
      seconds: $('[data-cd="seconds"]', root)
    };

    var target = weddingTimestamp();
    var finished = false;

    function render() {
      var diff = target - Date.now();

      if (diff <= 0) {
        if (!finished) {
          finished = true;
          root.classList.add('is-done');
          if (grid) { grid.hidden = true; }
          if (done) { done.hidden = false; }
          if (fields.seconds) { fields.seconds.textContent = '00'; }
        }
        return;
      }

      var seconds = Math.floor(diff / 1000);
      var values = {
        days: Math.floor(seconds / 86400),
        hours: Math.floor((seconds % 86400) / 3600),
        minutes: Math.floor((seconds % 3600) / 60),
        seconds: seconds % 60
      };

      Object.keys(fields).forEach(function (key) {
        if (fields[key]) { fields[key].textContent = pad(values[key]); }
      });
    }

    render();
    window.setInterval(render, 1000);
  }

  /* ======================================================================
     07. COPY DISCOUNT CODE
     ====================================================================== */

  function initCopyCode() {
    var button = $('[data-copy-target]');
    if (!button) { return; }
    var hint = $('#copyHint');
    var label = $('.copy-button__text', button);
    var source = document.getElementById(button.getAttribute('data-copy-target'));
    if (!source) { return; }

    var resetTimer = null;

    function fallbackCopy(text) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.top = '-1000px';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(field);
      return ok;
    }

    function confirmCopy() {
      button.classList.add('is-copied');
      if (label) { label.textContent = 'Copied!'; }
      if (hint) { hint.textContent = source.textContent.trim() + ' copied to your clipboard.'; }
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(function () {
        button.classList.remove('is-copied');
        if (label) { label.textContent = 'Copy Code'; }
        if (hint) { hint.textContent = 'Mention this code when you reserve your room.'; }
      }, 2000);
    }

    button.addEventListener('click', function () {
      var text = (source.textContent || '').trim();

      /* 1. Clipboard API (needs a secure context in most browsers) */
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(confirmCopy, function () {
          /* 2. Legacy selection-based copy */
          if (fallbackCopy(text)) { confirmCopy(); }
          else { manualHint(text); }
        });
        return;
      }

      /* 2 or 3 */
      if (fallbackCopy(text)) { confirmCopy(); } else { manualHint(text); }
    });

    function manualHint(text) {
      if (!hint) { return; }
      hint.textContent = 'Could not copy automatically — the code is ' + text + '. Please copy it manually.';
    }
  }

  /* ======================================================================
     08. SHUTTLE MODAL
     ====================================================================== */

  function initModal() {
    var modal = $('#shuttleModal');
    if (!modal) { return; }

    var dialog = $('.modal__dialog', modal);
    var lastFocused = null;
    var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function openModal(trigger) {
      lastFocused = trigger || document.activeElement;
      modal.hidden = false;
      document.body.classList.add('is-locked');
      window.requestAnimationFrame(function () { modal.classList.add('is-open'); });

      var first = dialog ? $(FOCUSABLE, dialog) : null;
      if (first) { first.focus(); }
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.classList.remove('is-locked');

      window.setTimeout(function () {
        modal.hidden = true;
        if (lastFocused && typeof lastFocused.focus === 'function') { lastFocused.focus(); }
      }, prefersReducedMotion() ? 0 : 320);
    }

    $$('[data-modal-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function () { openModal(trigger); });
    });
    $$('[data-modal-close]', modal).forEach(function (trigger) {
      trigger.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (event) {
      if (modal.hidden) { return; }

      if (event.key === 'Escape') { closeModal(); return; }

      if (event.key === 'Tab' && dialog) {
        var items = $$(FOCUSABLE, dialog).filter(function (el) {
          return el.offsetParent !== null || el === document.activeElement;
        });
        if (!items.length) { return; }

        var first = items[0];
        var last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ======================================================================
     09. RSVP
     ====================================================================== */

  function initRsvp() {
    var form = $('#rsvpForm');
    if (!form) { return; }

    var success = $('#rsvpSuccess');
    var editButton = $('#rsvpEdit');
    var submit = $('#rsvpSubmit');
    var note = $('[data-rsvp-note]', form);
    var nameInput = $('#rsvpName', form);
    var attendanceInputs = $$('input[name="attendance"]', form);

    if (note) {
      note.textContent = RSVP_ENDPOINT ? RSVP_ENDPOINT_NOTE_LIVE : RSVP_ENDPOINT_NOTE_DEMO;
    }

    function setError(key, field, message) {
      var box = $('[data-error-for="' + key + '"]', form);
      if (message) {
        if (field && field.classList) { field.classList.add('is-invalid'); }
        if (field && field.setAttribute) { field.setAttribute('aria-invalid', 'true'); }
        if (box) { box.textContent = message; box.hidden = false; }
      } else {
        if (field && field.classList) { field.classList.remove('is-invalid'); }
        if (field && field.removeAttribute) { field.removeAttribute('aria-invalid'); }
        if (box) { box.hidden = true; box.textContent = ''; }
      }
    }

    function validate() {
      var ok = true;
      var firstInvalid = null;
      var name = (nameInput.value || '').trim();
      var chosen = attendanceInputs.filter(function (input) { return input.checked; })[0];

      if (!name) {
        setError('rsvpName', nameInput, 'Please tell us your name.');
        firstInvalid = firstInvalid || nameInput;
        ok = false;
      } else if (name.length < 2) {
        setError('rsvpName', nameInput, 'Please enter at least 2 characters.');
        firstInvalid = firstInvalid || nameInput;
        ok = false;
      } else {
        setError('rsvpName', nameInput, '');
      }

      if (!chosen) {
        setError('attendance', null, 'Please let us know if you can join us.');
        firstInvalid = firstInvalid || attendanceInputs[0];
        ok = false;
      } else {
        setError('attendance', null, '');
      }

      if (firstInvalid && typeof firstInvalid.focus === 'function') {
        firstInvalid.focus();
      }
      return ok;
    }

    function showSuccess() {
      form.hidden = true;
      success.hidden = false;
      var heading = $('.rsvp-success__title', success);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }

    function showForm() {
      success.hidden = true;
      form.hidden = false;
      if (nameInput) { nameInput.focus(); }
    }

    function payload() {
      var chosen = attendanceInputs.filter(function (input) { return input.checked; })[0];
      return {
        name: (nameInput.value || '').trim(),
        attendance: chosen ? chosen.value : '',
        wishes: ($('#rsvpWishes', form).value || '').trim()
      };
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validate()) { return; }

      if (!RSVP_ENDPOINT) {
        showSuccess();
        return;
      }

      submit.disabled = true;
      submit.classList.add('is-loading');
      $('.primary-button__label', submit).textContent = 'Sending…';

      fetch(RSVP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload())
      })
        .then(function (response) {
          if (!response.ok) { throw new Error('Request failed: ' + response.status); }
          showSuccess();
        })
        .catch(function () {
          setError('rsvpName', nameInput, 'We could not send your response. Please try again.');
        })
        .then(function () {
          submit.disabled = false;
          submit.classList.remove('is-loading');
          $('.primary-button__label', submit).textContent = 'Send RSVP';
        });
    });

    nameInput.addEventListener('input', function () {
      if (nameInput.value.trim().length >= 2) { setError('rsvpName', nameInput, ''); }
    });

    attendanceInputs.forEach(function (input) {
      input.addEventListener('change', function () { setError('attendance', null, ''); });
    });

    if (editButton) { editButton.addEventListener('click', showForm); }
  }

  /* ======================================================================
     10. IMAGE FALLBACKS
     A failed remote placeholder gracefully becomes a plum/gold gradient
     instead of a broken-image icon.
     ====================================================================== */

  function initImageFallbacks() {
    $$('img').forEach(function (img) {
      var fail = function () {
        var frame = img.closest('.frame');
        if (frame) { frame.classList.add('is-missing'); }
        img.setAttribute('data-failed', 'true');
      };
      if (img.complete && img.naturalWidth === 0) { fail(); }
      img.addEventListener('error', fail);
    });
  }

  /* ======================================================================
     11. BOOT
     ====================================================================== */

  function initMapLink() {
    var button = $('#directionsBtn');
    if (button && venueMapUrl) { button.setAttribute('href', venueMapUrl); }
  }

  function boot() {
    applyMotionPreference();
    if (reduceMotionQuery) {
      var onPreferenceChange = function () { applyMotionPreference(); };
      if (reduceMotionQuery.addEventListener) { reduceMotionQuery.addEventListener('change', onPreferenceChange); }
      else if (reduceMotionQuery.addListener) { reduceMotionQuery.addListener(onPreferenceChange); }
    }

    initHeader();
    initNav();
    initSmoothScroll();
    initActiveNav();
    initReveal();
    initParticles();
    initCountdown();
    initCopyCode();
    initModal();
    initRsvp();
    initImageFallbacks();
    initMapLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
