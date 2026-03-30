const defaultInvitationData = {
  title: "Bride & Groom | A Love Story Premiere",
  coupleName: "BRIDE & GROOM",
  headlineTag: "#1 Wedding Invitation Today",
  dateLabel: "2027 | U/A 16+ | Season 1",
  description:
    "Two souls are set to debut their official union. A masterpiece produced by love, loyalty, and faith.",
  premiereDateTime: "2027-01-01T08:00:00+07:00",
  billboardImage:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1000",
  videoEmbedUrl: "https://www.youtube.com/embed/ywNQxL1xP6Q",
  introSoundUrl: "",
  backgroundMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  trailerAudioUrl: "",
  footerText: "Produced in Indonesia, 2027",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.56347862248!2d107.5731164!3d-6.9034443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x3e64398b6732388!2sBandung%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1711680000000!5m2!1sen!2sid",
  stills: [
    {
      src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=300",
      alt: "Still 1",
      badge: "EXCLUSIVE"
    },
    {
      src: "https://images.unsplash.com/photo-1522673607200-1648832cee77?auto=format&fit=crop&q=80&w=300",
      alt: "Still 2"
    },
    {
      src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=300",
      alt: "Still 3"
    },
    {
      src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=300",
      alt: "Still 4"
    }
  ],
  episodes: [
    {
      title: "1. Akad Nikah",
      time: "08:00 AM",
      summary:
        "Gedung Bale Asri, Bandung. The sacred ceremony starts here for the biggest premiere of the year.",
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=200"
    },
    {
      title: "2. Wedding Reception",
      time: "11:00 AM",
      summary:
        "Family, friends, and celebration begin right after the akad. 99.8% recommended.",
      image:
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=200"
    }
  ],
  crew: [
    {
      label: "THE GROOMSMEN",
      src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=400",
      alt: "Groomsmen"
    },
    {
      label: "THE BRIDESMAIDS",
      src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=400",
      alt: "Bridesmaids"
    }
  ]
};

const clientInvitationData = window.CLIENT_INVITATION_DATA || {};

const invitationData = {
  ...defaultInvitationData,
  ...clientInvitationData,
  stills: clientInvitationData.stills || defaultInvitationData.stills,
  episodes: clientInvitationData.episodes || defaultInvitationData.episodes,
  crew: clientInvitationData.crew || defaultInvitationData.crew
};

const apiKey = window.GEMINI_API_KEY || "";
let activeNarrationAudio = null;
let speechNarration = null;
let backgroundMusicAudio = null;
let introSequenceStarted = false;
let hasEnteredApp = false;

function getGuestNameFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const fromTo = params.get("to");
  const fromGuest = params.get("guest");
  const rawGuest = (fromTo || fromGuest || "").trim();
  return rawGuest || "The Guest";
}

function applyGuestIdentity() {
  const guestName = getGuestNameFromQuery();
  const profileNameEl = document.getElementById("profileGuestName");
  const guestInputEl = document.getElementById("guestNameInput");

  if (profileNameEl) {
    profileNameEl.innerText = guestName;
  }
  if (guestInputEl) {
    guestInputEl.value = guestName;
  }
}

function renderStaticData() {
  document.title = invitationData.title;

  const billboard = document.getElementById("billboardSection");
  billboard.style.backgroundImage = `url('${invitationData.billboardImage}')`;

  document.getElementById("coupleName").innerText = invitationData.coupleName;
  document.getElementById("headlineTag").innerText = invitationData.headlineTag;
  document.getElementById(
    "billboardDescription"
  ).innerHTML = `${invitationData.dateLabel}<br>${invitationData.description}`;
  document.getElementById("footerText").innerText = invitationData.footerText;

  const mapEl = document.getElementById("mapsEmbed");
  mapEl.src = invitationData.mapsEmbed;

  const videoEl = document.getElementById("invitationVideo");
  if (videoEl) {
    videoEl.src = invitationData.videoEmbedUrl;
  }
}

function renderStills() {
  const container = document.getElementById("productionStills");
  container.innerHTML = invitationData.stills
    .map(
      (item) => `
      <div class="thumbnail-container">
        <img src="${item.src}" class="thumbnail" alt="${item.alt}">
        ${
          item.badge
            ? `<div class="absolute bottom-2 left-2 bg-red-600 text-[8px] font-bold px-1 rounded-sm">${item.badge}</div>`
            : ""
        }
      </div>
    `
    )
    .join("");
}

function renderEpisodes() {
  const container = document.getElementById("episodes");
  container.innerHTML = invitationData.episodes
    .map(
      (item) => `
      <div class="flex gap-4 mb-6 group" onclick="showToast('Streaming location details...')">
        <div class="relative min-w-[120px] aspect-video rounded overflow-hidden">
          <img src="${item.image}" class="w-full h-full object-cover" alt="${item.title}">
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex justify-between text-xs font-bold mb-1">
            <span class="text-white">${item.title}</span>
            <span class="text-gray-500">${item.time}</span>
          </div>
          <p class="text-[10px] text-gray-400 leading-tight">${item.summary}</p>
        </div>
      </div>
    `
    )
    .join("");
}

function renderCrew() {
  const container = document.getElementById("crewList");
  container.innerHTML = invitationData.crew
    .map(
      (item) => `
      <div class="thumbnail-container thumbnail-landscape">
        <img src="${item.src}" class="thumbnail" alt="${item.alt}">
        <div class="absolute top-2 left-2 bg-black/60 text-[9px] px-2 py-1 font-bold">${item.label}</div>
      </div>
    `
    )
    .join("");
}

window.addEventListener("load", () => {
  const mainApp = document.getElementById("mainApp");
  const profileOverlay = document.getElementById("profileOverlay");
  if (mainApp) {
    mainApp.style.display = "none";
  }
  if (profileOverlay) {
    profileOverlay.style.display = "none";
    profileOverlay.style.pointerEvents = "none";
  }

  bindInteractionHandlers();
  applyGuestIdentity();
  renderStaticData();
  renderStills();
  renderEpisodes();
  renderCrew();
  setTimeout(() => {
    document.getElementById("introLayer").style.display = "none";
    const profileOverlay = document.getElementById("profileOverlay");
    profileOverlay.classList.remove("hidden");
    profileOverlay.style.display = "flex";
    profileOverlay.style.pointerEvents = "auto";
    profileOverlay.style.opacity = "1";
  }, 1450);
});

function bindInteractionHandlers() {
  const guestProfileCard = document.getElementById("guestProfileCard");
  if (guestProfileCard && !guestProfileCard.dataset.bound) {
    guestProfileCard.addEventListener("click", () => enterApp("Guest"));
    guestProfileCard.dataset.bound = "1";
  }

  const playBtn = document.getElementById("playInvitationButton");
  if (playBtn && !playBtn.dataset.bound) {
    playBtn.addEventListener("click", (event) => {
      event.preventDefault();
      playInvitationAudio();
    });
    playBtn.dataset.bound = "1";
  }

  const myListBtn = document.getElementById("myListButton");
  if (myListBtn && !myListBtn.dataset.bound) {
    myListBtn.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToRSVP();
    });
    myListBtn.dataset.bound = "1";
  }

  const submitBtn = document.getElementById("submitReviewButton");
  if (submitBtn && !submitBtn.dataset.bound) {
    submitBtn.addEventListener("click", (event) => {
      event.preventDefault();
      submitRSVP();
    });
    submitBtn.dataset.bound = "1";
  }

  const aiButtons = document.querySelectorAll("[data-ai-tone]");
  aiButtons.forEach((btn) => {
    if (btn.dataset.bound) {
      return;
    }
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      generateAiReview(btn.dataset.aiTone);
    });
    btn.dataset.bound = "1";
  });
}

async function startIntroSequence(fromGesture = false) {
  if (introSequenceStarted) {
    return;
  }
  introSequenceStarted = true;

  await playIntroSound(fromGesture);
  setTimeout(() => {
    startBackgroundMusic();
  }, 300);
}

async function playIntroSound(fromGesture = false) {
  if (invitationData.introSoundUrl) {
    const introAudio = new Audio(invitationData.introSoundUrl);
    introAudio.volume = 0.75;
    try {
      await introAudio.play();
      await waitForAudioEndOrTimeout(introAudio, 1600);
      return;
    } catch (_err) {
      // fallback to the next intro mode
    }
  }

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Say 'Ta dum' in a very low, bassy, cinematic drum sound."
                  }
                ]
              }
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Iapetus" } }
              }
            }
          })
        }
      );
      const data = await response.json();
      const base64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64) {
        const audio = new Audio(URL.createObjectURL(pcmToWav(base64, 24000)));
        audio.volume = 0.5;
        await audio.play();
        await waitForAudioEndOrTimeout(audio, 1600);
        return;
      }
    } catch (_e) {
      // fallback to generated effect
    }
  }

  if (fromGesture || document.visibilityState === "visible") {
    await playSyntheticTaDum();
  }
}

async function playSyntheticTaDum() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return;
  }

  try {
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.3;
    master.connect(ctx.destination);

    const playHit = (delay, startFreq, endFreq, gainValue) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(startFreq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + delay + 0.24);
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(gainValue, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.32);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + delay);
      osc.stop(now + delay + 0.33);
    };

    playHit(0.02, 95, 45, 0.9);
    playHit(0.42, 75, 35, 0.75);

    await new Promise((resolve) => setTimeout(resolve, 900));
    ctx.close();
  } catch (_err) {
    // ignore
  }
}

async function startBackgroundMusic() {
  if (backgroundMusicAudio) {
    try {
      await backgroundMusicAudio.play();
    } catch (_err) {
      // ignore autoplay rejection
    }
    return;
  }

  if (!invitationData.backgroundMusicUrl) {
    return;
  }

  backgroundMusicAudio = new Audio(invitationData.backgroundMusicUrl);
  backgroundMusicAudio.loop = true;
  backgroundMusicAudio.volume = 0.25;
  try {
    await backgroundMusicAudio.play();
  } catch (_err) {
    // autoplay may be blocked; first user gesture listener will retry
  }
}

function waitForAudioEndOrTimeout(audio, timeoutMs) {
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) {
        return;
      }
      finished = true;
      resolve();
    };
    audio.addEventListener("ended", done, { once: true });
    setTimeout(done, timeoutMs);
  });
}

function enterApp(_profile) {
  if (hasEnteredApp) {
    return;
  }
  hasEnteredApp = true;
  startIntroSequence(true);
  const profileOverlay = document.getElementById("profileOverlay");
  profileOverlay.style.opacity = "0";
  profileOverlay.style.pointerEvents = "none";
  setTimeout(() => {
    profileOverlay.classList.add("hidden");
    profileOverlay.style.display = "none";
    const app = document.getElementById("mainApp");
    app.classList.remove("hidden");
    app.style.display = "block";
    runOpeningAnimations();
    startCountdown();
  }, 500);
}

function runOpeningAnimations() {
  const app = document.getElementById("mainApp");
  if (!app) {
    return;
  }

  const targets = app.querySelectorAll(".reveal-on-enter");
  targets.forEach((el, index) => {
    el.style.setProperty("--enter-delay", `${80 + index * 70}ms`);
    el.classList.remove("is-visible");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.2
    }
  );

  targets.forEach((el) => {
    observer.observe(el);
  });
}

let countdownHandle;

function startCountdown() {
  const target = new Date(invitationData.premiereDateTime).getTime();

  if (countdownHandle) {
    clearInterval(countdownHandle);
  }

  countdownHandle = setInterval(() => {
    const now = Date.now();
    const diff = Math.max(target - now, 0);
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const els = document.getElementById("countdown").children;
    els[0].innerHTML = `${String(d).padStart(2, "0")} <span class="block text-[7px] not-italic uppercase opacity-60">Days</span>`;
    els[2].innerHTML = `${String(h).padStart(2, "0")} <span class="block text-[7px] not-italic uppercase opacity-60">Hrs</span>`;
    els[4].innerHTML = `${String(m).padStart(2, "0")} <span class="block text-[7px] not-italic uppercase opacity-60">Mins</span>`;
    els[6].innerHTML = `${String(s).padStart(2, "0")} <span class="block text-[7px] not-italic uppercase opacity-60">Secs</span>`;
  }, 1000);
}

async function playInvitationAudio() {
  const btn = document.querySelector(".btn-play");
  if (!btn) {
    return;
  }
  const originalHtml = btn.innerHTML;

  if (activeNarrationAudio && !activeNarrationAudio.paused) {
    activeNarrationAudio.pause();
    activeNarrationAudio.currentTime = 0;
    activeNarrationAudio = null;
    btn.innerHTML = originalHtml;
    return;
  }

  if (speechNarration && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    speechNarration = null;
    btn.innerHTML = originalHtml;
    return;
  }

  try {
    btn.innerHTML = "<span>Loading...</span>";

    if (invitationData.trailerAudioUrl) {
      activeNarrationAudio = new Audio(invitationData.trailerAudioUrl);
      activeNarrationAudio.play();
      btn.innerHTML = "<span>Stop</span>";
      activeNarrationAudio.onended = () => {
        btn.innerHTML = originalHtml;
        activeNarrationAudio = null;
      };
      return;
    }

    if (apiKey) {
      const prompt = `Narrate this in a cinematic movie trailer voice: In a world of billions, two souls found a 99 percent match. ${invitationData.coupleName}. The grand premiere of their life begins soon. RSVP now to secure your seat.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
              }
            }
          })
        }
      );

      const data = await response.json();
      const base64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64) {
        activeNarrationAudio = new Audio(URL.createObjectURL(pcmToWav(base64, 24000)));
        activeNarrationAudio.play();
        btn.innerHTML = "<span>Stop</span>";
        activeNarrationAudio.onended = () => {
          btn.innerHTML = originalHtml;
          activeNarrationAudio = null;
        };
        return;
      }
    }

    if ("speechSynthesis" in window) {
      const text = `In a world of billions, two souls found each other. ${invitationData.coupleName}. Their grand premiere begins soon. RSVP now to secure your seat.`;
      speechNarration = new SpeechSynthesisUtterance(text);
      speechNarration.rate = 0.95;
      speechNarration.pitch = 0.8;
      speechNarration.onend = () => {
        btn.innerHTML = originalHtml;
        speechNarration = null;
      };
      window.speechSynthesis.speak(speechNarration);
      btn.innerHTML = "<span>Stop</span>";
      return;
    }

    btn.innerHTML = originalHtml;
    showToast("Audio is not supported on this browser");
  } catch (_err) {
    btn.innerHTML = originalHtml;
    if ("speechSynthesis" in window) {
      const text = `${invitationData.coupleName}. The grand premiere begins soon.`;
      speechNarration = new SpeechSynthesisUtterance(text);
      speechNarration.onend = () => {
        btn.innerHTML = originalHtml;
        speechNarration = null;
      };
      window.speechSynthesis.speak(speechNarration);
      btn.innerHTML = "<span>Stop</span>";
    }
  }
}

async function generateAiReview(tone) {
  if (!apiKey) {
    showToast("Set GEMINI_API_KEY to enable AI review");
    return;
  }

  const name = document.getElementById("guestNameInput").value || "The Critic";
  const textarea = document.getElementById("reviewText");
  const loader = document.getElementById("aiLoader");
  loader.classList.remove("hidden");

  try {
    const prompt = `Write a 1-sentence movie review for a wedding. Guest: ${name}. Tone: ${tone}. If critic, act like Rotten Tomatoes. If oscar, call it Best Picture. If sundanese, use very polite high Sundanese.`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await response.json();
    textarea.value = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } finally {
    loader.classList.add("hidden");
  }
}

function pcmToWav(base64Pcm, sampleRate) {
  const pcmBuffer = Uint8Array.from(atob(base64Pcm), (c) => c.charCodeAt(0));
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i += 1) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 32 + pcmBuffer.length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, pcmBuffer.length, true);

  return new Blob([header, pcmBuffer], { type: "audio/wav" });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

function scrollToRSVP() {
  document.getElementById("rsvpSection").scrollIntoView({ behavior: "smooth" });
}

function submitRSVP() {
  showToast("REVIEW POSTED!");
}
