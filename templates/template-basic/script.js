const data = {
  couple: "Andi & Sari",
  date: "20 December 2026",
  venue: "Jakarta",
  wa: "628123456789"
};

document.getElementById("couple").innerText = data.couple;
document.getElementById("date").innerText = data.date;
document.getElementById("venue").innerText = data.venue;

document.getElementById("wa").href =
  `https://wa.me/${data.wa}?text=I will attend`;