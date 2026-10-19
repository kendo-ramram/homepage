/*
 * 화면 구성 스크립트
 * 내용 수정은 site-config.js와 constitutions.js에서 하세요. 이 파일은 고칠 필요가 없습니다.
 */
(function () {
  const S = window.SITE;
  const C = S.clinic;

  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  // [확인 필요] 표시를 눈에 띄는 꼬리표로 바꿉니다.
  const rich = s => esc(s).replace(/\[확인 필요\]\s*/g, '<mark class="tbd">확인 필요</mark> ').replace(/\n/g, "<br>");
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const mapLinks = {
    naver: "https://map.naver.com/p/search/" + encodeURIComponent(C.mapQuery),
    kakao: "https://map.kakao.com/link/search/" + encodeURIComponent(C.mapQuery),
    embed: "https://maps.google.com/maps?q=" + encodeURIComponent(C.mapQuery) + "&z=17&output=embed"
  };

  /* 페이지 제목과 설명, 섹션 제목 */
  document.title = S.page.title;
  let metaDesc = $('meta[name="description"]');
  if (!metaDesc) { metaDesc = document.createElement("meta"); metaDesc.name = "description"; document.head.appendChild(metaDesc); }
  metaDesc.content = S.page.description;
  $$("[data-page-heading]").forEach(el => { el.innerHTML = rich(S.page.heading); });
  $$("[data-page-lead]").forEach(el => { el.innerHTML = rich(S.page.lead); });
  $$("[data-section-heading]").forEach(el => { el.innerHTML = rich((S.sections[el.dataset.sectionHeading] || {}).heading || ""); });
  $$("[data-section-lead]").forEach(el => { el.innerHTML = rich((S.sections[el.dataset.sectionLead] || {}).lead || ""); });
  // data-section-text="구역.항목" 형식 (예: constitution.cabinetHeading)
  $$("[data-section-text]").forEach(el => {
    const [key, field] = el.dataset.sectionText.split(".");
    el.innerHTML = rich((S.sections[key] || {})[field] || "");
  });

  /* 헤더 */
  const header = $("[data-site-header]");
  if (header) {
    header.outerHTML = `
    <a class="skip" href="#main">본문으로 건너뛰기</a>
    <header class="site-header">
      <div class="wrap header-inner">
        <a href="#top" class="brand"><img src="about/logo.png" alt="${esc(C.name)} 처음으로" width="130" height="36"></a>
        <nav class="nav" id="site-nav" aria-label="주요 메뉴">
          <ul>${S.nav.map(n => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join("")}</ul>
          <a class="nav-call" href="tel:${C.phoneTel}">전화 문의 ${esc(C.phone)}</a>
        </nav>
        <a class="header-call" href="tel:${C.phoneTel}"><span class="header-call-label">전화 문의</span> ${esc(C.phone)}</a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">
          <span class="menu-icon" aria-hidden="true"></span><span class="visually-hidden">메뉴 열기</span>
        </button>
      </div>
    </header>`;
    const btn = $(".menu-btn");
    const nav = $("#site-nav");
    const setOpen = open => {
      btn.setAttribute("aria-expanded", open);
      $(".visually-hidden", btn).textContent = open ? "메뉴 닫기" : "메뉴 열기";
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };
    btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
    $$("a", nav).forEach(a => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); btn.focus(); } });
    window.matchMedia("(min-width: 960px)").addEventListener("change", e => { if (e.matches) setOpen(false); });

    // 지금 보고 있는 섹션을 메뉴에 표시
    const links = $$(".nav ul a");
    const targets = links.map(a => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
    const mark = () => {
      const line = window.innerHeight * 0.35;
      let current = targets[0];
      targets.forEach(t => { if (t.getBoundingClientRect().top <= line) current = t; });
      links.forEach(a => {
        if (a.getAttribute("href") === "#" + current.id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { mark(); ticking = false; });
    }, { passive: true });
    mark();
  }

  /* 푸터와 모바일 하단 바 */
  const footer = $("[data-site-footer]");
  if (footer) {
    footer.outerHTML = `
    <footer class="site-footer">
      <div class="wrap footer-grid">
        <div>
          <img src="about/logo.png" alt="${esc(C.name)}" width="130" height="36" class="footer-logo">
          <p class="footer-slogan">${esc(C.slogan)}</p>
        </div>
        <div class="footer-info">
          <p>${esc(C.address)}</p>
          <p>전화 <a href="tel:${C.phoneTel}">${esc(C.phone)}</a></p>
          <p>대표원장 ${esc(S.doctor.name)}</p>
        </div>
        <nav aria-label="하단 메뉴">
          <ul class="footer-nav">${S.nav.map(n => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join("")}</ul>
        </nav>
      </div>
      <div class="wrap footer-bottom">
        <p>홈페이지의 건강 정보는 일반적인 안내이며, 개인의 진단과 치료는 한의사와 상담하시기 바랍니다.</p>
        <p>Copyright © ${esc(C.nameEn)}. All rights reserved.</p>
      </div>
    </footer>
    <div class="mobile-bar">
      <a href="tel:${C.phoneTel}" class="mobile-bar-call">전화 문의</a>
      <a href="#location">오시는 길</a>
    </div>`;
  }

  /* 연락처, 주소, 지도 */
  $$("[data-tel]").forEach(a => { a.href = "tel:" + C.phoneTel; });
  $$("[data-phone]").forEach(el => { el.textContent = C.phone; });
  $$("[data-address]").forEach(el => { el.textContent = C.address; });
  $$("[data-reservation]").forEach(el => { el.innerHTML = rich(S.reservation); });
  $$("[data-map]").forEach(el => {
    const url = mapLinks[el.dataset.map];
    if (el.tagName === "IFRAME") el.src = url; else el.href = url;
  });

  /* 진료 시간 */
  const today = new Date().getDay();
  $$("[data-hours]").forEach(el => {
    el.innerHTML = `
      <table class="hours">
        <caption class="visually-hidden">요일별 진료 시간</caption>
        <tbody>
          ${S.hours.map(h => {
            const isToday = h.dows.includes(today);
            return `
          <tr class="${h.closed ? "is-closed" : ""}${isToday ? " is-today" : ""}">
            <th scope="row">${esc(h.day)}${isToday ? ' <!--span class="today-tag">오늘</span-->' : ""}</th>
            <td>${rich(h.time)}</td>
          </tr>`;
          }).join("")}
          <tr class="is-lunch"><th scope="row">점심시간</th><td>${esc(S.lunch)}</td></tr>
        </tbody>
      </table>`;
  });
  $$("[data-today]").forEach(el => {
    const h = S.hours.find(x => x.dows.includes(today));
    const label = ["일", "월", "화", "수", "목", "금", "토"][today];
    if (!h) { el.textContent = "오늘 진료 시간은 전화로 확인해 주세요."; return; }
    el.innerHTML = h.closed
      ? `오늘(${label})은 휴진입니다`
      : `오늘(${label}) 진료 <strong>${rich(h.time)}</strong>`;
  });

  /* 의료진 */
  $$("[data-doctor]").forEach(el => {
    const d = S.doctor;
    el.innerHTML = `
      <div class="doctor-photo">
        ${d.photo
          ? `<img src="${esc(d.photo)}" alt="${esc(d.photoAlt || d.name + " " + d.role)}" width="2100" height="2664" loading="lazy">`
          : `<div class="photo-slot" role="img" aria-label="원장 사진 준비 중"><span>원장 사진</span><mark class="tbd">확인 필요</mark></div>`}
      </div>
      <div class="doctor-body">
        <h4 class="doctor-name">${esc(d.name)} <span>${esc(d.role)}</span></h4>
        <p class="doctor-role">${esc(d.specialty)}</p>
        <div class="doctor-career-groups">
          ${d.career.map(g => `
          <section class="doctor-career-group">
            <h5>${esc(g.title)}</h5>
            <ul class="doctor-career">${g.items.map(c => `<li>${rich(c)}</li>`).join("")}</ul>
          </section>`).join("")}
        </div>
      </div>`;
  });

  /* 자주 묻는 질문 */
  $$("[data-faq]").forEach(el => {
    el.innerHTML = S.faq.map(f => `
      <details class="faq-item">
        <summary>${esc(f.q)}</summary>
        <div class="faq-answer"><p>${rich(f.a)}</p></div>
      </details>`).join("");
  });

  /* 8체질 한약장: 서랍을 누르면 오른쪽 카드에 체질 설명이 나옵니다 */
  const T = window.CONSTITUTIONS;
  const cabinet = $("[data-cabinet]");
  if (T && cabinet) initCabinet();

  function initCabinet() {
    const HANJA = { 목: "木", 토: "土", 금: "金", 수: "水", 양: "陽", 음: "陰" };
    const ROWS = ["금", "토", "목", "수"];
    const order = ROWS.flatMap(el => ["양", "음"].map(pole => T.find(t => t.el === el && t.pole === pole)));
    const card = $("[data-type-card]");
    let selected = order[0].id;

    order.forEach(t => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "drawer";
      b.id = "drawer-" + t.id;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", "type-card");
      b.innerHTML = `<span class="drawer-hanja" aria-hidden="true">${HANJA[t.el]}${HANJA[t.pole]}</span><span class="drawer-name">${t.el}${t.pole}<span class="visually-hidden">체질</span></span><span class="drawer-knob" aria-hidden="true"></span>`;
      b.addEventListener("click", () => {
        select(t.id);
        // 모바일에서는 카드가 서랍 아래에 있으므로 카드가 보이도록 스크롤
        if (!window.matchMedia("(min-width: 960px)").matches) card.scrollIntoView({ block: "start" });
      });
      cabinet.appendChild(b);
    });

    // 방향키: 좌우는 양/음, 위아래는 금/토/목/수
    cabinet.addEventListener("keydown", e => {
      const i = order.findIndex(t => t.id === selected);
      const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 2, ArrowUp: -2 }[e.key];
      let n = step === undefined ? null : i + step;
      if (e.key === "Home") n = 0;
      if (e.key === "End") n = order.length - 1;
      if (n === null || n < 0 || n >= order.length) return;
      e.preventDefault();
      select(order[n].id);
      $("#drawer-" + order[n].id).focus();
    });

    function select(id) {
      selected = id;
      order.forEach(t => {
        const d = $("#drawer-" + t.id);
        const on = t.id === id;
        d.setAttribute("aria-selected", on);
        d.tabIndex = on ? 0 : -1;
      });
      render(order.find(t => t.id === id));
    }

    function render(t) {
      card.setAttribute("aria-labelledby", "drawer-" + t.id);
      card.innerHTML = `
        <header class="type-card-head">
          <h4>${esc(t.name)}</h4><span lang="en">${esc(t.latin)}</span>
        </header>
        <p>${t.traits.map(esc).join(" ")}</p>
        <p><strong class="type-card-label">생활 관리</strong>${t.care.map(esc).join(" ")}</p>
        <div class="food-boxes">
          <section class="food-box good">
            <h5>잘 맞는 음식</h5>
            <p>${t.good.map(esc).join(", ")}</p>
          </section>
          <section class="food-box bad">
            <h5>맞지 않는 음식</h5>
            <p>${t.bad.map(esc).join(", ")}</p>
          </section>
        </div>`;
    }

    select(selected);
  }
})();