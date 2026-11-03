/* Portfolio terminal. Reads everything from /data/*.json.
   You normally never edit this file: add content in the JSON files. */
(function () {
  "use strict";

  var TABS = ["profile", "experience", "education", "projects", "skills", "contact"];
  var DATA = {};
  var lang = "en";
  var current = "profile";

  /* ---------- helpers ---------- */

  // Pick the text for the current language. Falls back to English when the French field is empty.
  function tr(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v;
    var s = v[lang];
    var empty = s == null || s === "" || (Array.isArray(s) && s.length === 0);
    return empty ? v.en : s;
  }

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) {
      if (c == null) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }

  // Text node, or a highlighted span when the string starts with TODO.
  function txt(s) {
    s = String(s);
    if (/^\s*TODO/.test(s)) return h("span", { class: "todo", text: s });
    // Highlight an inline "— TODO: ..." tail too.
    var i = s.indexOf("TODO");
    if (i > 0) {
      var span = h("span");
      span.appendChild(document.createTextNode(s.slice(0, i)));
      span.appendChild(h("span", { class: "todo", text: s.slice(i) }));
      return span;
    }
    return document.createTextNode(s);
  }

  function ui(path) {
    var parts = path.split("."), o = DATA.ui;
    for (var i = 0; i < parts.length; i++) o = o && o[parts[i]];
    return tr(o);
  }

  function list(items) {
    var arr = tr(items) || [];
    if (!arr.length) return null;
    return h("ul", {}, arr.map(function (x) { return h("li", {}, [txt(x)]); }));
  }

  function row(label, node) {
    if (!node) return [];
    return [h("dt", { text: label }), h("dd", {}, [node])];
  }

  /* ---------- sections ---------- */

  function renderProfile() {
    var p = DATA.profile, root = h("div");
    var cv = p.cv && p.cv.file
      ? h("a", { class: "btn", href: p.cv.file, download: "" , text: ui("labels.downloadCv") })
      : h("a", { class: "btn", "aria-disabled": "true", role: "link", text: ui("labels.cvMissing") });

    root.appendChild(h("div", { class: "hero" }, [
      h("img", { class: "avatar", src: p.photo, alt: tr(p.photoAlt), width: "180", height: "180" }),
      h("div", { class: "hero-text" }, [
        h("h1", { text: p.name }),
        h("p", { class: "lead" }, [txt(tr(p.headline))]),
        cv
      ])
    ]));

    root.appendChild(h("h2", { text: ui("tabs.profile") }));
    (tr(p.bio) || []).forEach(function (para) {
      root.appendChild(h("p", {}, [txt(para)]));
    });

    root.appendChild(h("h2", { text: ui("labels.places") }));
    var ul = h("ul", { class: "places" });
    (DATA.places || []).forEach(function (pl) {
      ul.appendChild(h("li", {}, [
        h("span", { class: "kind " + pl.type, text: ui("labels." + pl.type) }),
        h("span", { text: pl.name }),
        h("span", { class: "muted" }, [txt(tr(pl.period))])
      ]));
    });
    root.appendChild(ul);
    return root;
  }

  function renderExperience() {
    var root = h("div");
    root.appendChild(h("h2", { text: ui("tabs.experience") }));
    DATA.experience.forEach(function (x) {
      var title = h("h3", {}, [document.createTextNode(x.company)]);
      if (x.status === "upcoming") title.appendChild(h("span", { class: "tag", text: ui("labels.upcomingTag") }));
      var dl = h("dl", {});
      [].concat(
        row(ui("labels.role"), txt(tr(x.role))),
        row(ui("labels.context"), txt(tr(x.context))),
        row(ui("labels.actions"), list(x.actions)),
        row(ui("labels.result"), txt(tr(x.result)))
      ).forEach(function (n) { dl.appendChild(n); });
      root.appendChild(h("article", { class: "entry" }, [
        h("div", { class: "entry-head" }, [title, h("span", { class: "period" }, [txt(tr(x.period))])]),
        h("div", { class: "org", text: x.location }),
        dl
      ]));
    });
    return root;
  }

  function renderEducation() {
    var root = h("div");
    root.appendChild(h("h2", { text: ui("tabs.education") }));
    DATA.education.forEach(function (x) {
      var body = h("div", {}, [
        h("div", {}, [txt(tr(x.degree))]),
        list(x.details)
      ]);
      root.appendChild(h("article", { class: "entry" }, [
        h("div", { class: "entry-head" }, [
          h("h3", { text: x.school }),
          h("span", { class: "period" }, [txt(tr(x.period))])
        ]),
        body
      ]));
    });
    return root;
  }

  function renderProjects() {
    var root = h("div");
    root.appendChild(h("h2", { text: ui("tabs.projects") }));
    DATA.projects.forEach(function (x) {
      var title = h("h3", {}, [txt(tr(x.title))]);
      if (x.status === "inProgress") title.appendChild(h("span", { class: "tag", text: ui("labels.inProgress") }));
      var dl = h("dl", {});
      [].concat(
        row(ui("labels.context"), txt(tr(x.context))),
        row(ui("labels.myRole"), txt(tr(x.myRole))),
        row(ui("labels.actions"), list(x.actions)),
        row(ui("labels.result"), txt(tr(x.result)))
      ).forEach(function (n) { dl.appendChild(n); });
      root.appendChild(h("article", { class: "entry" }, [
        h("div", { class: "entry-head" }, [title, h("span", { class: "period" }, [txt(tr(x.period))])]),
        dl
      ]));
    });
    return root;
  }

  function renderSkills() {
    var s = DATA.skills, root = h("div");

    root.appendChild(h("h2", { text: ui("labels.tools") }));
    var g1 = h("div", { class: "grid" });
    s.tools.forEach(function (t) {
      g1.appendChild(h("div", { class: "card" }, [
        h("h3", { text: t.name }),
        h("p", {}, [txt(tr(t.evidence))])
      ]));
    });
    root.appendChild(g1);

    root.appendChild(h("h2", { text: ui("labels.languages") }));
    var g2 = h("div", { class: "grid" });
    s.languages.forEach(function (l) {
      g2.appendChild(h("div", { class: "card" }, [
        h("h3", { text: tr(l.name) }),
        h("p", {}, [txt(tr(l.level))])
      ]));
    });
    root.appendChild(g2);

    root.appendChild(h("h2", { text: ui("labels.certifications") }));
    var shown = s.certifications.filter(function (c) { return c.visible; });
    if (!shown.length) {
      root.appendChild(h("p", { class: "muted", text: ui("labels.noCerts") }));
    } else {
      var g3 = h("div", { class: "grid" });
      shown.forEach(function (c) {
        g3.appendChild(h("div", { class: "card" }, [
          h("h3", { text: c.name }),
          h("p", { text: [c.score, c.date].filter(Boolean).join(" · ") })
        ]));
      });
      root.appendChild(g3);
    }
    return root;
  }

  function renderContact() {
    var c = DATA.profile.contact, root = h("div");
    root.appendChild(h("h2", { text: ui("tabs.contact") }));
    root.appendChild(h("p", {}, [txt(tr(c.intro))]));
    var ul = h("ul", { class: "list" });
    if (c.email) ul.appendChild(h("li", {}, [h("a", { href: "mailto:" + c.email, text: c.email })]));
    if (c.linkedin) ul.appendChild(h("li", {}, [h("a", { href: c.linkedin, rel: "noopener", text: "LinkedIn" })]));
    if (ul.children.length) root.appendChild(ul);
    return root;
  }

  var RENDER = {
    profile: renderProfile, experience: renderExperience, education: renderEducation,
    projects: renderProjects, skills: renderSkills, contact: renderContact
  };

  /* ---------- shell ---------- */

  function renderTabs() {
    var nav = document.getElementById("tabs");
    nav.textContent = "";
    TABS.forEach(function (id, i) {
      var b = h("button", {
        class: "tab", type: "button", role: "tab", id: "tab-" + id,
        "aria-selected": String(id === current),
        tabindex: id === current ? "0" : "-1",
        "data-tab": id
      }, [h("span", { class: "n", text: "F" + (i + 1) }), document.createTextNode(ui("tabs." + id))]);
      b.addEventListener("click", function () { go(id); });
      b.addEventListener("keydown", function (e) {
        var i2 = TABS.indexOf(id), n = null;
        if (e.key === "ArrowRight") n = TABS[(i2 + 1) % TABS.length];
        else if (e.key === "ArrowLeft") n = TABS[(i2 + TABS.length - 1) % TABS.length];
        if (n) { e.preventDefault(); go(n); document.getElementById("tab-" + n).focus(); }
      });
      nav.appendChild(b);
    });
  }

  function renderScreen() {
    var screen = document.getElementById("content");
    screen.textContent = "";
    screen.setAttribute("aria-labelledby", "tab-" + current);
    screen.appendChild(RENDER[current]());
    document.getElementById("status-left").textContent = "> " + current + ".run  [" + lang.toUpperCase() + "]";
  }

  function renderChrome() {
    document.documentElement.lang = lang;
    document.title = tr(DATA.ui.siteTitle);
    document.getElementById("terminal-title").textContent = tr(DATA.ui.terminalTitle);
    document.getElementById("skip-link").textContent = ui("skip");
    var b = document.getElementById("lang-btn");
    b.textContent = ui("langButton");
    b.setAttribute("aria-label", ui("langLabel"));
  }

  function go(id) {
    if (TABS.indexOf(id) < 0) id = "profile";
    current = id;
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    renderTabs();
    renderScreen();
  }

  function setLang(l) {
    lang = l === "fr" ? "fr" : "en";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    renderChrome();
    renderTabs();
    renderScreen();
  }

  function initialLang() {
    var q = /[?&]lang=(en|fr)/.exec(location.search);
    if (q) return q[1];
    try { var s = localStorage.getItem("lang"); if (s === "en" || s === "fr") return s; } catch (e) {}
    return "en"; // English first, as planned
  }

  function load(name) {
    return fetch("data/" + name + ".json").then(function (r) {
      if (!r.ok) throw new Error(name + ": HTTP " + r.status);
      return r.json();
    });
  }

  var names = ["ui", "profile", "experience", "education", "projects", "skills", "places"];
  Promise.all(names.map(load)).then(function (res) {
    names.forEach(function (n, i) { DATA[n] = res[i]; });
    lang = initialLang();
    var hash = location.hash.replace("#", "");
    current = TABS.indexOf(hash) >= 0 ? hash : "profile";
    document.getElementById("lang-btn").addEventListener("click", function () {
      setLang(lang === "en" ? "fr" : "en");
    });
    renderChrome();
    renderTabs();
    renderScreen();
    window.addEventListener("hashchange", function () {
      var hh = location.hash.replace("#", "");
      if (TABS.indexOf(hh) >= 0 && hh !== current) go(hh);
    });
  }).catch(function (err) {
    var el = document.getElementById("content");
    el.textContent = "";
    el.appendChild(h("p", { class: "todo", text: "Could not load the content files. If you opened this page by double-clicking it, run a local server (see README). On GitHub Pages this works normally." }));
    el.appendChild(h("p", { class: "muted mono", text: String(err && err.message || err) }));
  });
})();
