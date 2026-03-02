/**
 * ED-OPS i18n — Global language manager
 * Loads translations dynamically from /data/i18n/{lang}.json.
 * Supports EN / FR with localStorage persistence.
 * Usage: include before navbar.js; use data-i18n="key" on elements.
 */
(function () {
  'use strict';

  var DEFAULT_LANG = 'en';
  var STORAGE_KEY  = 'edops-lang';
  var SUPPORTED    = ['en', 'fr'];

  var translations = { en: {}, fr: {} };
  var currentLang  = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || DEFAULT_LANG;
  if (SUPPORTED.indexOf(currentLang) === -1) currentLang = DEFAULT_LANG;

  /* ---- Resolve root path from this script's src ---- */
  function getRootPath() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('i18n.js') !== -1) {
        return scripts[i].src.replace(/assets\/js\/i18n\.js[^/]*$/, '');
      }
    }
    return './';
  }

  /* ---- Core translation lookup ---- */
  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) ||
           (translations[DEFAULT_LANG] && translations[DEFAULT_LANG][key]) ||
           key;
  }

  /* ---- Apply data-i18n attributes to entire DOM ---- */
  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val !== key) el.textContent = val;
    });
  }

  /* ---- Language switch ---- */
  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    currentLang = lang;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
    document.dispatchEvent(new CustomEvent('edops:langchange', { detail: { lang: lang } }));
  }

  function getLang() { return currentLang; }

  /* ---- Ready promise ---- */
  var _resolveReady;
  var ready = new Promise(function (resolve) { _resolveReady = resolve; });

  /* ---- Load both language files from JSON ---- */
  var root = getRootPath();
  Promise.all(
    SUPPORTED.map(function (lang) {
      return fetch(root + 'data/i18n/' + lang + '.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { translations[lang] = data; });
    })
  ).then(function () {
    applyTranslations();
    _resolveReady();
    document.dispatchEvent(new CustomEvent('edops:i18n:ready'));
  }).catch(function (err) {
    console.warn('ED-OPS i18n: failed to load translation files', err);
    _resolveReady();
  });

  window.EDOpsI18n = { t: t, setLang: setLang, getLang: getLang, applyTranslations: applyTranslations, ready: ready };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();
