const data = {
  couple: "Andi & Sari",
  date: "20 Dec 2026",
  venue: "Bekasi",
  wa: "628123456789"
};

document.getElementById("couple").innerText = data.couple;
document.getElementById("date").innerText = data.date;
document.getElementById("venue").innerText = data.venue;

document.getElementById("wa").href =
  `https://wa.me/${data.wa}?text=I will attend`;