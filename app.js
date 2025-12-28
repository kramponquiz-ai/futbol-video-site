const $ = (s) => document.querySelector(s);

function fmtDate(iso){
  try{
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("tr-TR", { year:"numeric", month:"short", day:"2-digit" });
  }catch{ return iso; }
}

function uniqCats(){
  const set = new Set(VIDEOS.map(v => v.cat));
  return ["all", ...Array.from(set)];
}

function getThumb(id){
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function renderHome(){
  const grid = $("#grid");
  if(!grid) return;

  $("#y").textContent = new Date().getFullYear();

  // categories
  const catSel = $("#cat");
  catSel.innerHTML = "";
  uniqCats().forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c === "all" ? "Hepsi" : c;
    catSel.appendChild(opt);
  });

  const q = $("#q");
  const sortSel = $("#sort");
  const empty = $("#empty");

  function apply(){
    const query = (q.value || "").toLowerCase().trim();
    const cat = catSel.value;
    const sort = sortSel.value;

    let list = [...VIDEOS];

    // filter
    if(cat !== "all"){
      list = list.filter(v => v.cat === cat);
    }
    if(query){
      list = list.filter(v =>
        v.title.toLowerCase().includes(query) ||
        v.desc.toLowerCase().includes(query) ||
        (v.tags || []).join(" ").toLowerCase().includes(query)
      );
    }

    // sort
    if(sort === "new"){
      list.sort((a,b) => (b.date || "").localeCompare(a.date || ""));
    }else if(sort === "old"){
      list.sort((a,b) => (a.date || "").localeCompare(b.date || ""));
    }else if(sort === "title"){
      list.sort((a,b) => a.title.localeCompare(b.title, "tr"));
    }

    // render
    grid.innerHTML = "";
    empty.classList.toggle("hidden", list.length !== 0);

    list.forEach(v => {
      const a = document.createElement("a");
      a.className = "carditem";
      a.href = `video.html?v=${encodeURIComponent(v.id)}`;

      const img = document.createElement("img");
      img.className = "thumb";
      img.loading = "lazy";
      img.src = getThumb(v.id);
      img.alt = v.title;

      const body = document.createElement("div");
      body.className = "carditem__body";

      const h = document.createElement("h3");
      h.className = "carditem__title";
      h.textContent = v.title;

      const meta = document.createElement("p");
      meta.className = "carditem__meta";
      meta.textContent = `${v.cat} • ${fmtDate(v.date)}`;

      body.appendChild(h);
      body.appendChild(meta);

      a.appendChild(img);
      a.appendChild(body);
      grid.appendChild(a);
    });
  }

  q.addEventListener("input", apply);
  catSel.addEventListener("change", apply);
  sortSel.addEventListener("change", apply);

  apply();
}

function renderVideoPage(){
  const titleEl = $("#title");
  if(!titleEl) return;

  $("#y").textContent = new Date().getFullYear();

  const params = new URLSearchParams(location.search);
  const vid = params.get("v");
  const v = VIDEOS.find(x => x.id === vid) || VIDEOS[0];

  document.title = `${v.title} | Futbol Video`;
  titleEl.textContent = v.title;

  $("#meta").textContent = `${v.cat} • ${fmtDate(v.date)}`;
  $("#desc").textContent = v.desc || "";

  // embed
  const iframe = $("#yt");
  iframe.src = `https://www.youtube.com/embed/${v.id}?rel=0`;

  // tags
  const tagsEl = $("#tags");
  tagsEl.innerHTML = "";
  (v.tags || []).forEach(t => {
    const s = document.createElement("span");
    s.className = "tag";
    s.textContent = t;
    tagsEl.appendChild(s);
  });

  // copy link
  $("#copyBtn").addEventListener("click", async () => {
    const link = location.href;
    try{
      await navigator.clipboard.writeText(link);
      $("#copyHint").textContent = "✅ Link kopyalandı.";
    }catch{
      $("#copyHint").textContent = "Kopyalanamadı. Link: " + link;
    }
  });

  // related (same category)
  const rel = $("#related");
  const relatedList = VIDEOS
    .filter(x => x.id !== v.id && x.cat === v.cat)
    .slice(0, 6);

  rel.innerHTML = "";
  relatedList.forEach(x => {
    const a = document.createElement("a");
    a.className = "carditem";
    a.href = `video.html?v=${encodeURIComponent(x.id)}`;

    const img = document.createElement("img");
    img.className = "thumb";
    img.loading = "lazy";
    img.src = getThumb(x.id);
    img.alt = x.title;

    const body = document.createElement("div");
    body.className = "carditem__body";

    const h = document.createElement("h3");
    h.className = "carditem__title";
    h.textContent = x.title;

    const meta = document.createElement("p");
    meta.className = "carditem__meta";
    meta.textContent = `${x.cat} • ${fmtDate(x.date)}`;

    body.appendChild(h);
    body.appendChild(meta);

    a.appendChild(img);
    a.appendChild(body);
    rel.appendChild(a);
  });

  if(!relatedList.length){
    rel.innerHTML = `<p class="muted">Bu kategori için henüz benzer video eklenmemiş.</p>`;
  }
}

// init
renderHome();
renderVideoPage();
