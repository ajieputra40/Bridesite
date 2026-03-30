// ambil query param (?to=nama)
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// inject nama tamu
function renderGuestName(elementId) {
  const guest = getQueryParam("to");
  if (guest) {
    document.getElementById(elementId).innerText =
      `Dear ${decodeURIComponent(guest)}`;
  }
}

// format tanggal simple
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// generate WA link otomatis
function generateWhatsAppLink(phone, name) {
  return `https://wa.me/${phone}?text=Hi, I am ${encodeURIComponent(name)}, I will attend`;
}

// smooth scroll
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth"
  });
}

// copy text (buat share link)
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  alert("Copied!");
}