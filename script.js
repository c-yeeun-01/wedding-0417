const WEDDING = {
  date: new Date(2027, 3, 17, 14, 0, 0),
  venue: "아산터미널웨딩홀",
};

const PHOTOS = [
  "main.jpg", "g01.jpg", "g02.jpg", "g03.jpg", "g05.jpg",
  "g06.jpg", "g07.jpg", "g09.jpg", "g10.jpg", "g11.jpg",
  "g08.jpg", "g12.jpg", "g04.jpg", "g13.jpg",
];
const INITIAL_PHOTOS = 9;

/* ---------- 인트로: 하트 안으로 줌 → 랜딩 사진 ---------- */
(function intro() {
  const HOLD_MS = 3400;
  const ZOOM_MS = 2000;

  const el = document.getElementById("intro");
  const scene = document.getElementById("scene");
  const photo = document.getElementById("revealPhoto");
  const target = document.getElementById("heartTarget");
  let zoomed = false;

  function align() {
    if (zoomed) return;
    const box = el.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const cx = r.left - box.left + r.width / 2;
    const cy = r.top - box.top + r.height * 0.4;
    photo.style.setProperty("--cx", `${cx}px`);
    photo.style.setProperty("--cy", `${cy}px`);
    photo.style.setProperty("--hs", `${r.width}px`);
    scene.style.transformOrigin = `${cx}px ${cy}px`;
  }

  function zoom() {
    if (zoomed) return;
    align();
    zoomed = true;
    const box = el.getBoundingClientRect();
    el.classList.add("zoom");
    photo.style.setProperty("--hs", `${Math.max(box.width, box.height) * 7}px`);

    setTimeout(() => {
      el.classList.add("done");
      document.body.classList.remove("intro-active");
      document.body.classList.add("intro-done");
    }, ZOOM_MS - 150);
    setTimeout(() => el.remove(), ZOOM_MS + 800);
  }

  function start() {
    align();
    requestAnimationFrame(() => el.classList.add("ready"));
    setTimeout(zoom, HOLD_MS);
  }

  window.addEventListener("resize", align);
  el.addEventListener("click", zoom);

  const img = new Image();
  img.src = "images/main.jpg";
  Promise.all([
    img.decode().catch(() => {}),
    document.fonts ? document.fonts.ready : Promise.resolve(),
  ]).then(start);
})();

/* ---------- 달력 ---------- */
(function renderCalendar() {
  const body = document.getElementById("calBody");
  const y = WEDDING.date.getFullYear();
  const m = WEDDING.date.getMonth();
  const first = new Date(y, m, 1).getDay();
  const last = new Date(y, m + 1, 0).getDate();

  let html = "<span></span>".repeat(first);
  for (let d = 1; d <= last; d++) {
    const dow = (first + d - 1) % 7;
    const cls = [dow === 0 ? "sun" : "", dow === 6 ? "sat" : "", d === WEDDING.date.getDate() ? "wedding" : ""]
      .filter(Boolean)
      .join(" ");
    html += `<span class="${cls}"><b>${d}</b></span>`;
  }
  body.innerHTML = html;
})();

/* ---------- 디데이 카운트다운 ---------- */
(function countdown() {
  const els = {};
  document.querySelectorAll("#countdown [data-unit]").forEach((el) => (els[el.dataset.unit] = el));
  const text = document.getElementById("ddayText");

  function tick() {
    const diff = WEDDING.date - new Date();
    const abs = Math.max(diff, 0);
    els.d.textContent = Math.floor(abs / 86400000);
    els.h.textContent = Math.floor((abs / 3600000) % 24);
    els.m.textContent = Math.floor((abs / 60000) % 60);
    els.s.textContent = Math.floor((abs / 1000) % 60);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weddingDay = new Date(WEDDING.date);
    weddingDay.setHours(0, 0, 0, 0);
    const days = Math.round((weddingDay - today) / 86400000);
    text.innerHTML =
      days > 0
        ? `두 사람의 결혼식이 <b>${days}일</b> 남았습니다`
        : days === 0
          ? `오늘, 두 사람이 <b>결혼합니다</b>`
          : `두 사람이 함께한 지 <b>${-days}일</b> 되었습니다`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- 갤러리 + 라이트박스 ---------- */
(function gallery() {
  const wrap = document.getElementById("gallery");
  const moreBtn = document.getElementById("moreBtn");
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCount = document.getElementById("lbCount");
  let current = 0;

  wrap.innerHTML = PHOTOS.map(
    (src, i) =>
      `<button type="button" data-i="${i}" class="${i >= INITIAL_PHOTOS ? "hidden" : ""}">
         <img src="images/${src}" alt="웨딩 사진 ${i + 1}" loading="lazy" />
       </button>`
  ).join("");

  if (PHOTOS.length <= INITIAL_PHOTOS) moreBtn.remove();
  moreBtn?.addEventListener("click", () => {
    wrap.querySelectorAll(".hidden").forEach((el) => el.classList.remove("hidden"));
    moreBtn.remove();
  });

  function show(i) {
    current = (i + PHOTOS.length) % PHOTOS.length;
    lbImg.src = `images/${PHOTOS[current]}`;
    lbCount.textContent = `${current + 1} / ${PHOTOS.length}`;
  }
  function open(i) {
    show(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-i]");
    if (btn) open(Number(btn.dataset.i));
  });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  let startX = 0;
  lb.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });
})();

/* ---------- 지도 링크 ---------- */
(function maps() {
  const q = encodeURIComponent(WEDDING.venue);
  document.getElementById("naverMap").href = `https://map.naver.com/p/search/${q}`;
  document.getElementById("kakaoMap").href = `https://map.kakao.com/link/search/${q}`;
})();

/* ---------- 복사 / 공유 ---------- */
const toast = (() => {
  const el = document.getElementById("toast");
  let timer;
  return (msg) => {
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("show"), 1800);
  };
})();

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-copy], [data-copy-target]");
  if (!btn) return;
  const text = btn.dataset.copy ?? document.getElementById(btn.dataset.copyTarget).textContent;
  await copyText(text.trim());
  toast("복사되었습니다");
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  const data = { title: document.title, text: "저희 결혼식에 초대합니다 💌", url: location.href };
  if (navigator.share) {
    try { await navigator.share(data); } catch { /* 공유 취소 */ }
  } else {
    await copyText(location.href);
    toast("링크가 복사되었습니다");
  }
});

/* ---------- 스크롤 등장 효과 ---------- */
(function reveal() {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("show");
          io.unobserve(en.target);
        }
      }),
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
