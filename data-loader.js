// ============================================================
// MD Cakes — Shared Data Loader
// Fetches data.json (cakes, prices, contact info) and exposes
// it to every page. Falls back to sensible defaults if the
// file can't be loaded (e.g. opened locally without a server).
// ============================================================

const SITE_DATA_DEFAULTS = {
  contact: {
    address: "Old Road, Kopay, Irupalai<br>Near Pyramid Education Centre<br>Jaffna, Sri Lanka",
    phone: "1234567",
    phoneDial: "1234567",
    whatsapp: "1234567",
    email: "abc@gmail.com",
    hours: "Mon – Sat: 9:00 AM – 8:00 PM<br>Sunday: 10:00 AM – 4:00 PM"
  },
  categories: [],
  menuNote: ""
};

async function loadSiteData() {
  try {
    // Cache-bust so visitors always get the latest saved data
    const res = await fetch(`data.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("data.json not found");
    // Explicitly decode as UTF-8 regardless of server-sent headers,
    // so characters like — and – never turn into garbled symbols.
    const buffer = await res.arrayBuffer();
    const text = new TextDecoder('utf-8').decode(buffer);
    return JSON.parse(text);
  } catch (e) {
    console.warn("Could not load data.json, using built-in defaults.", e);
    return SITE_DATA_DEFAULTS;
  }
}

// ---- Render helpers used across pages ----

function applyContactToPage(contact) {
  document.querySelectorAll('[data-field="address"]').forEach(el => el.innerHTML = contact.address);
  document.querySelectorAll('[data-field="phone"]').forEach(el => el.textContent = contact.phone);
  document.querySelectorAll('[data-field="email"]').forEach(el => el.textContent = contact.email);
  document.querySelectorAll('[data-field="hours"]').forEach(el => el.innerHTML = contact.hours);
  document.querySelectorAll('a[data-field="phoneHref"]').forEach(el => el.href = `tel:${contact.phoneDial}`);
  document.querySelectorAll('a[data-field="emailHref"]').forEach(el => el.href = `mailto:${contact.email}`);
  document.querySelectorAll('a[data-field="whatsappHref"]').forEach(el => el.href = `https://wa.me/${contact.whatsapp}`);
  document.querySelectorAll('[data-field="phoneFooter"]').forEach(el => { el.textContent = contact.phone; el.href = `tel:${contact.phoneDial}`; });
  document.querySelectorAll('[data-field="emailFooter"]').forEach(el => { el.textContent = contact.email; el.href = `mailto:${contact.email}`; });
  document.querySelectorAll('[data-field="addressFooter"]').forEach(el => el.innerHTML = contact.address);

  // Social links — hide the icon entirely if no URL is set
  applySocialLink('instagram', contact.instagram);
  applySocialLink('facebook', contact.facebook);
  applySocialLink('youtube', contact.youtube);
}

function applySocialLink(platform, url) {
  document.querySelectorAll(`[data-social="${platform}"]`).forEach(el => {
    if (url && url.trim()) {
      el.href = url.trim();
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
}

function renderMenu(data) {
  const container = document.getElementById('menuContainer');
  const noteEl = document.getElementById('menuNote');
  if (!container) return;

  container.innerHTML = '';
  (data.categories || []).forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'menu-cat';

    const head = document.createElement('div');
    head.className = 'section-head';
    head.style.marginBottom = '24px';
    head.innerHTML = `<h2 style="font-size:1.6rem;">${escapeHtml(cat.name)}</h2>`;
    catDiv.appendChild(head);

    const list = document.createElement('div');
    list.className = 'menu-list';
    (cat.items || []).forEach(item => {
      const row = document.createElement('div');
      row.className = 'menu-item';
      row.innerHTML = `
        <div class="m-left"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.desc || '')}</p></div>
        <div class="m-price">${escapeHtml(item.price)}</div>
      `;
      list.appendChild(row);
    });
    catDiv.appendChild(list);
    container.appendChild(catDiv);
  });

  if (noteEl) noteEl.textContent = data.menuNote || '';
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  }
