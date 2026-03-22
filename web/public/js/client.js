(function () {
  'use strict';

  function readConfigFromMeta() {
    var base = document.querySelector('meta[name="wirbooks-api-base"]');
    var key = document.querySelector('meta[name="wirbooks-api-key"]');
    return {
      apiBase: (base && base.getAttribute('content')) || '',
      apiKey: (key && key.getAttribute('content')) || '',
    };
  }

  var cfg = window.__ML && window.__ML.apiBase ? window.__ML : readConfigFromMeta();
  window.__ML = cfg;
  var DEVICE_KEY = 'ml_web_device_id';
  var page = window.__ML_PAGE || '';

  function resolveMediaUrl(url) {
    if (!url) return '';
    var s = String(url);
    if (/^https?:\/\//i.test(s)) return s;
    var origin = cfg.apiBase.replace(/\/api\/?$/i, '') || cfg.apiBase;
    return s.startsWith('/') ? origin + s : origin + '/' + s;
  }

  function $(sel) {
    return document.querySelector(sel);
  }

  function apiHeaders(includeJson) {
    var h = {};
    if (includeJson) h['Content-Type'] = 'application/json';
    if (cfg.apiKey) h['X-API-Key'] = cfg.apiKey;
    var id = localStorage.getItem(DEVICE_KEY);
    if (id) h['X-Device-ID'] = id;
    return h;
  }

  function getDeviceId() {
    try {
      return localStorage.getItem(DEVICE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setDeviceId(id) {
    try {
      localStorage.setItem(DEVICE_KEY, id);
    } catch (e) {}
  }

  var regPromise = null;
  function ensureDevice() {
    var ex = getDeviceId();
    if (ex) return Promise.resolve(ex);
    if (regPromise) return regPromise;
    regPromise = fetch(cfg.apiBase + '/device/register', {
      method: 'POST',
      headers: apiHeaders(true),
      body: JSON.stringify({ deviceName: 'Wirbooks Web', platform: 'web' }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.success && data.data && data.data.id) {
          setDeviceId(data.data.id);
          return data.data.id;
        }
        return null;
      })
      .catch(function () {
        return null;
      })
      .finally(function () {
        regPromise = null;
      });
    return regPromise;
  }

  function formatTime(sec) {
    sec = Math.floor(sec || 0);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ---------- Library ---------- */
  function renderLibraryGrid(books) {
    var grid = $('#library-grid');
    var load = $('#library-loading');
    if (!grid) return;
    if (load) load.remove();
    if (!books.length) {
      grid.innerHTML =
        '<p class="text-on-surface-variant col-span-full">Favori yok. Kitap sayfasından kalp ikonuna tıklayın.</p>';
      return;
    }
    grid.innerHTML = books
      .map(function (b) {
        return (
          '<article class="group">' +
          '<a href="/book/' +
          b.id +
          '" class="no-underline">' +
          '<div class="relative mb-3 aspect-[2/3] overflow-hidden rounded-md shadow-xl transition-all group-hover:scale-[1.02]">' +
          (b.cover
            ? '<img class="w-full h-full object-cover" alt="" src="' +
              esc(b.cover) +
              '"/>'
            : '') +
          '</div>' +
          '<h3 class="font-semibold text-on-surface truncate">' +
          esc(b.title) +
          '</h3>' +
          '<p class="text-sm text-on-surface/60 truncate">' +
          esc(b.author) +
          '</p>' +
          '</a></article>'
        );
      })
      .join('');
    var w = $('#library-mini-widget');
    if (w && books[0]) {
      w.hidden = false;
      var c = $('#lw-cover');
      if (c && books[0].cover) c.src = books[0].cover;
      var t = $('#lw-title');
      if (t) t.textContent = books[0].title;
      var a = $('#lw-author');
      if (a) a.textContent = books[0].author;
      var l = $('#lw-link');
      if (l) {
        l.href = '/play/' + books[0].id;
      }
    }
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function fetchBookJson(id) {
    return fetch(cfg.apiBase + '/books/' + encodeURIComponent(id), { headers: apiHeaders(false) }).then(function (r) {
      return r.json();
    });
  }

  function runLibrary() {
    ensureDevice().then(function () {
      return fetch(cfg.apiBase + '/device/favorites', { headers: apiHeaders(false) });
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!data || !data.success || !Array.isArray(data.data)) {
          renderLibraryGrid([]);
          return;
        }
        var ids = data.data.map(function (x) {
          return x.book_id;
        });
        if (!ids.length) {
          renderLibraryGrid([]);
          return;
        }
        return Promise.all(
          ids.map(function (id) {
            return fetchBookJson(id).then(function (j) {
              if (!j.success || !j.data) return null;
              var row = j.data;
              var cat = row.category;
              return {
                id: row.id,
                title: row.title,
                author: row.author,
                cover: resolveMediaUrl(row.cover_image || row.cover_url || ''),
              };
            });
          })
        );
      })
      .then(function (books) {
        if (books) renderLibraryGrid(books.filter(Boolean));
      })
      .catch(function () {
        var grid = $('#library-grid');
        if (grid) grid.innerHTML = '<p class="text-tertiary col-span-full">Yüklenemedi.</p>';
      });
  }

  /* ---------- Book favorite ---------- */
  function runBook() {
    var btn = $('#btn-fav');
    if (!btn) return;
    var bookId = btn.getAttribute('data-book-id');
    ensureDevice()
      .then(function () {
        return fetch(cfg.apiBase + '/device/favorites', { headers: apiHeaders(false) });
      })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.success && Array.isArray(data.data)) {
          var ids = data.data.map(function (x) {
            return x.book_id;
          });
          if (ids.indexOf(bookId) >= 0) {
            btn.textContent = '♥';
            btn.setAttribute('data-is-fav', '1');
          }
        }
      })
      .catch(function () {});

    btn.addEventListener('click', function () {
      var isFav = btn.getAttribute('data-is-fav') === '1';
      var url =
        cfg.apiBase + '/device/favorites/' + encodeURIComponent(bookId);
      ensureDevice().then(function () {
        fetch(url, {
          method: isFav ? 'DELETE' : 'POST',
          headers: apiHeaders(!isFav),
          body: isFav ? undefined : '{}',
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (d) {
            if (d && d.success) {
              btn.setAttribute('data-is-fav', isFav ? '0' : '1');
              btn.textContent = isFav ? '♡' : '♥';
            }
          });
      });
    });
  }

  /* ---------- Player ---------- */
  function runPlayer() {
    var bookEl = $('#ml-book');
    var chEl = $('#ml-chapters');
    if (!bookEl || !chEl) return;
    var book = JSON.parse(bookEl.textContent);
    var chapters = JSON.parse(chEl.textContent);
    if (!chapters.length) return;

    var idx = 0;
    var initial = window.__ML_INITIAL_CHAPTER || '';
    if (initial) {
      var found = chapters.findIndex(function (c) {
        return c.id === initial;
      });
      if (found >= 0) idx = found;
    }

    var audio = $('#audio-el');
    var btnPlay = $('#btn-play');
    var iconPlay = $('#icon-play');
    var seekBar = $('#seek-bar');
    var seekWrap = $('#seek-wrap');
    var tCur = $('#t-current');
    var tTot = $('#t-total');
    var tCh = $('#t-chapter');
    var lastSave = 0;

    function highlightChapter() {
      document.querySelectorAll('.chapter-pick').forEach(function (el) {
        var i = parseInt(el.getAttribute('data-idx'), 10);
        if (i === idx) {
          el.classList.add('bg-surface-container-high', 'border-primary/20');
          el.style.borderWidth = '1px';
          el.style.borderStyle = 'solid';
        } else {
          el.classList.remove('bg-surface-container-high', 'border-primary/20');
          el.style.borderWidth = '';
          el.style.borderStyle = '';
        }
      });
    }

    function saveProgress() {
      var now = Date.now();
      if (now - lastSave < 8000) return;
      lastSave = now;
      var ch = chapters[idx];
      if (!ch || !audio) return;
      ensureDevice().then(function () {
        fetch(cfg.apiBase + '/device/progress/' + encodeURIComponent(book.id), {
          method: 'POST',
          headers: apiHeaders(true),
          body: JSON.stringify({
            chapterId: ch.id,
            currentTime: Math.floor(audio.currentTime || 0),
          }),
        }).catch(function () {});
      });
    }

    function loadChapter(i) {
      idx = i;
      var ch = chapters[idx];
      if (!ch) return;
      highlightChapter();
      if (tCh) tCh.textContent = ch.title;
      fetch(cfg.apiBase + '/chapters/' + encodeURIComponent(ch.id) + '/stream', { headers: apiHeaders(false) })
        .then(function (r) {
          return r.json();
        })
        .then(function (d) {
          if (!d || !d.success || !d.data) return;
          var url = d.data.audioUrl || d.data.audio_url;
          if (!url) return;
          if (!/^https?:\/\//i.test(url)) {
            var base = cfg.apiBase.replace(/\/api\/?$/i, '');
            url = url.startsWith('/') ? base + url : base + '/' + url;
          }
          audio.src = url;
          audio.load();
          audio.play().catch(function () {});
          if (iconPlay) iconPlay.textContent = 'pause';
        });
    }

    audio.addEventListener('play', function () {
      if (iconPlay) iconPlay.textContent = 'pause';
    });
    audio.addEventListener('pause', function () {
      if (iconPlay) iconPlay.textContent = 'play_arrow';
    });

    audio.addEventListener('timeupdate', function () {
      if (tCur) tCur.textContent = formatTime(audio.currentTime);
      if (tTot && audio.duration) tTot.textContent = formatTime(audio.duration);
      if (seekBar && audio.duration) {
        seekBar.style.width = (audio.currentTime / audio.duration) * 100 + '%';
      }
      saveProgress();
    });

    audio.addEventListener('ended', function () {
      if (idx < chapters.length - 1) loadChapter(idx + 1);
    });

    btnPlay.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().catch(function () {});
        if (iconPlay) iconPlay.textContent = 'pause';
      } else {
        audio.pause();
        if (iconPlay) iconPlay.textContent = 'play_arrow';
      }
    });

    $('#btn-prev-ch').addEventListener('click', function () {
      if (idx > 0) loadChapter(idx - 1);
    });
    $('#btn-next-ch').addEventListener('click', function () {
      if (idx < chapters.length - 1) loadChapter(idx + 1);
    });

    document.querySelectorAll('.chapter-pick').forEach(function (el) {
      el.addEventListener('click', function () {
        var i = parseInt(el.getAttribute('data-idx'), 10);
        loadChapter(i);
      });
    });

    if (seekWrap) {
      seekWrap.addEventListener('click', function (e) {
        var rect = seekWrap.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var r = x / rect.width;
        if (audio.duration) audio.currentTime = r * audio.duration;
      });
    }

    var notesPanel = $('#notes-panel');
    var noteKey = 'ml_notes_' + book.id;

    function loadNotes() {
      try {
        var raw = localStorage.getItem(noteKey);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    function saveNotes(arr) {
      try {
        localStorage.setItem(noteKey, JSON.stringify(arr));
      } catch (e) {}
    }

    function renderNotes() {
      var list = $('#notes-list');
      if (!list) return;
      var arr = loadNotes();
      list.innerHTML = arr
        .map(function (n) {
          return (
            '<div class="pl-3 border-l-2 border-tertiary/40"><p class="text-xs text-tertiary font-bold">' +
            esc(n.t || '') +
            '</p><p class="text-sm text-on-surface/80 mt-1">' +
            esc(n.text) +
            '</p></div>'
          );
        })
        .join('');
    }

    $('#btn-notes-open').addEventListener('click', function () {
      if (notesPanel) notesPanel.classList.add('active');
      renderNotes();
    });
    $('#btn-notes-close').addEventListener('click', function () {
      if (notesPanel) notesPanel.classList.remove('active');
    });
    $('#btn-note-save').addEventListener('click', function () {
      var inp = $('#note-input');
      if (!inp || !inp.value.trim()) return;
      var arr = loadNotes();
      arr.unshift({
        text: inp.value.trim(),
        t: formatTime(audio.currentTime || 0),
      });
      saveNotes(arr);
      inp.value = '';
      renderNotes();
    });

    loadChapter(idx);
    if (audio.duration) {
      if (tTot) tTot.textContent = formatTime(audio.duration);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (page === 'library') runLibrary();
    if (page === 'book') runBook();
    if (page === 'player') runPlayer();
  });
})();
