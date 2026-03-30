let audio;

function initMusic(src) {
  audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.5;

  // autoplay workaround (browser butuh interaction)
  document.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {});
    }
  }, { once: true });
}

function toggleMusic() {
  if (!audio) return;

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

// optional: bikin button control
function renderMusicButton() {
  const btn = document.createElement("button");
  btn.innerText = "🎵 Music";
  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.right = "20px";
  btn.style.padding = "10px";

  btn.onclick = toggleMusic;
  document.body.appendChild(btn);
}