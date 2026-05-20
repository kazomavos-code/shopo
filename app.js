const STORAGE_KEY = "shopee-affiliate-upload-planner-v1";

const state = {
  items: [],
  search: ""
};

const els = {
  bulkInput: document.querySelector("#bulkInput"),
  parseInput: document.querySelector("#parseInput"),
  queue: document.querySelector("#queue"),
  template: document.querySelector("#itemTemplate"),
  addSample: document.querySelector("#addSample"),
  clearAll: document.querySelector("#clearAll"),
  exportCsv: document.querySelector("#exportCsv"),
  applyGenerator: document.querySelector("#applyGenerator"),
  captionStyle: document.querySelector("#captionStyle"),
  niche: document.querySelector("#niche"),
  startTime: document.querySelector("#startTime"),
  interval: document.querySelector("#interval"),
  search: document.querySelector("#search"),
  totalItems: document.querySelector("#totalItems"),
  readyItems: document.querySelector("#readyItems"),
  missingItems: document.querySelector("#missingItems")
};

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  render();
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  state.items = raw ? JSON.parse(raw) : [];
  render();
}

function parseLine(line) {
  const parts = line.split("|").map((part) => part.trim()).filter(Boolean);
  const linkIndex = parts.findIndex((part) => /^https?:\/\//i.test(part));
  const link = linkIndex >= 0 ? parts[linkIndex] : "";
  const title = parts.find((part, index) => index !== linkIndex && !/^\d+$/.test(part)) || inferTitle(link);
  const price = parts.find((part) => /^\d+$/.test(part)) || "";
  const category = parts.find((part, index) => index !== linkIndex && part !== title && part !== price) || "";

  return {
    id: uid(),
    title,
    link,
    price,
    category,
    video: "",
    schedule: "",
    caption: "",
    hashtags: "",
    status: link ? "Draft" : "Perlu Dicek"
  };
}

function inferTitle(link) {
  if (!link) return "Produk affiliate";
  try {
    const url = new URL(link);
    const slug = decodeURIComponent(url.pathname.split("/").filter(Boolean)[0] || "Produk affiliate");
    return slug.replace(/[-_.]+/g, " ").slice(0, 80);
  } catch {
    return "Produk affiliate";
  }
}

function formatCurrency(value) {
  const number = Number(String(value).replace(/[^\d]/g, ""));
  if (!number) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

function buildCaption(item) {
  const title = item.title || "produk ini";
  const price = formatCurrency(item.price);
  const niche = els.niche.value.trim() || "daily finds";
  const priceLine = price ? ` Harga sekitar ${price}.` : "";

  if (els.captionStyle.value === "review") {
    return `Aku masukin ${title} ke list ${niche} karena kelihatannya kepakai buat harian.${priceLine} Cek detail dan voucher lewat link affiliate ini.`;
  }

  if (els.captionStyle.value === "promo") {
    return `${title} lagi wajib dicek hari ini.${priceLine} Klik link affiliate sebelum stok atau voucher berubah.`;
  }

  return `Kalau lagi cari ${niche}, ${title} bisa jadi pilihan yang praktis.${priceLine} Detail produk ada di link affiliate.`;
}

function buildHashtags(item) {
  const category = (item.category || "shopeefinds").toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `#ShopeeAffiliate #ShopeeFinds #RacunShopee #${category}`;
}

function setSchedules() {
  const startValue = els.startTime.value;
  if (!startValue) return;

  const interval = Math.max(Number(els.interval.value) || 30, 5);
  const start = new Date(startValue);

  state.items.forEach((item, index) => {
    if (item.schedule) return;
    const date = new Date(start.getTime() + index * interval * 60 * 1000);
    item.schedule = toDatetimeLocal(date);
  });
}

function toDatetimeLocal(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function updateItem(id, patch) {
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return;
  Object.assign(item, patch);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  updateStats();
}

function render() {
  updateStats();
  els.queue.innerHTML = "";

  const query = state.search.trim().toLowerCase();
  const items = state.items.filter((item) => {
    if (!query) return true;
    return [item.title, item.link, item.category, item.status, item.caption]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = state.items.length ? "Tidak ada item yang cocok." : "Belum ada antrian. Tempel link produk di input cepat.";
    els.queue.append(empty);
    return;
  }

  items.forEach((item) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    bindInput(node, ".title", item, "title");
    bindInput(node, ".link", item, "link");
    bindInput(node, ".price", item, "price");
    bindInput(node, ".category", item, "category");
    bindInput(node, ".video", item, "video");
    bindInput(node, ".schedule", item, "schedule");
    bindInput(node, ".caption", item, "caption");
    bindInput(node, ".hashtags", item, "hashtags");
    bindInput(node, ".status", item, "status");

    node.querySelector(".copyCaption").addEventListener("click", async () => {
      await navigator.clipboard.writeText([item.caption, item.hashtags, item.link].filter(Boolean).join("\n\n"));
    });

    node.querySelector(".copyUpload").addEventListener("click", async () => {
      const payload = [
        `Judul: ${item.title || "-"}`,
        `Video: ${item.video || "-"}`,
        `Jadwal: ${item.schedule || "-"}`,
        "",
        item.caption || "",
        item.hashtags || "",
        item.link || ""
      ].filter((line, index) => index < 4 || line).join("\n");
      await navigator.clipboard.writeText(payload);
    });

    node.querySelector(".openLink").addEventListener("click", () => {
      if (item.link) window.open(item.link, "_blank", "noopener");
    });

    node.querySelector(".remove").addEventListener("click", () => {
      state.items = state.items.filter((entry) => entry.id !== item.id);
      save();
    });

    els.queue.append(node);
  });
}

function bindInput(node, selector, item, key) {
  const input = node.querySelector(selector);
  input.value = item[key] || "";
  input.addEventListener("input", () => updateItem(item.id, { [key]: input.value }));
}

function updateStats() {
  const ready = state.items.filter((item) => item.status === "Siap Upload").length;
  const missing = state.items.filter((item) => !item.link || !item.video || !item.caption).length;
  els.totalItems.textContent = state.items.length;
  els.readyItems.textContent = ready;
  els.missingItems.textContent = missing;
}

function exportCsv() {
  const headers = ["title", "affiliate_link", "price", "category", "video_file", "schedule", "caption", "hashtags", "status"];
  const rows = state.items.map((item) => [
    item.title,
    item.link,
    item.price,
    item.category,
    item.video,
    item.schedule,
    item.caption,
    item.hashtags,
    item.status
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shopee-affiliate-upload-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

els.parseInput.addEventListener("click", () => {
  const lines = els.bulkInput.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  state.items.push(...lines.map(parseLine));
  els.bulkInput.value = "";
  save();
});

els.applyGenerator.addEventListener("click", () => {
  setSchedules();
  state.items.forEach((item) => {
    if (!item.caption) item.caption = buildCaption(item);
    if (!item.hashtags) item.hashtags = buildHashtags(item);
    if (item.link && item.video && item.caption) item.status = "Siap Upload";
  });
  save();
});

els.addSample.addEventListener("click", () => {
  state.items.push(
    parseLine("Tas selempang wanita | https://shopee.co.id/tas-selempang-affiliate | 59000 | Fashion"),
    parseLine("Lampu meja LED | https://shopee.co.id/lampu-meja-led | 89000 | Rumah")
  );
  save();
});

els.clearAll.addEventListener("click", () => {
  if (!confirm("Hapus semua antrian?")) return;
  state.items = [];
  save();
});

els.exportCsv.addEventListener("click", exportCsv);
els.search.addEventListener("input", () => {
  state.search = els.search.value;
  render();
});

const now = new Date();
now.setMinutes(now.getMinutes() + 30);
els.startTime.value = toDatetimeLocal(now);
load();
