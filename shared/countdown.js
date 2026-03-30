const targetDate = new Date("2026-12-20").getTime();

setInterval(() => {
  const now = new Date().getTime();
  const diff = targetDate - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  document.getElementById("timer").innerText =
    days + " days to go";
}, 1000);