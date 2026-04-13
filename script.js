let player;
let shortsList = [];
let currentIndex = 0;
let startY = 0;

// YouTube API callback
function onYouTubeIframeAPIReady() {
  loadPlayer("dQw4w9WgXcQ"); // default video
  updateInfo("Doomscroll Bypass – Shorts Player", "Your Channel");
}

// Load or switch videos
function loadPlayer(videoId) {
  if (player) {
    player.loadVideoById(videoId);
    return;
  }

  player = new YT.Player("shorts-container", {
    height: "640",
    width: "360",
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0
    }
  });
}

// Update title + channel name
function updateInfo(title, channel) {
  document.getElementById("videoTitle").textContent = title || "";
  document.getElementById("channelName").textContent = channel || "";
  updateNavButtons();
}

// Search Shorts using backend
async function searchShorts() {
  const query = document.getElementById("searchBar").value.trim();
  if (!query) return;

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    shortsList = (data.results || [])
      .filter(v => v.id && v.id.length > 5)
      .map(v => ({
        id: v.id,
        title: v.title || "",
        channelTitle: v.channelTitle || ""
      }));

    if (!shortsList.length) return;

    currentIndex = 0;
    const first = shortsList[0];
    loadPlayer(first.id);
    updateInfo(first.title, first.channelTitle);
  } catch (e) {
    console.error("Search error:", e);
  }
}

// Next video
function nextShort() {
  if (!shortsList.length) return;

  if (currentIndex < shortsList.length - 1) {
    currentIndex++;
  } else {
    currentIndex = 0; // loop
  }

  const vid = shortsList[currentIndex];
  loadPlayer(vid.id);
  updateInfo(vid.title, vid.channelTitle);
}

// Previous video
function prevShort() {
  if (!shortsList.length) return;

  if (currentIndex > 0) {
    currentIndex--;
  } else {
    currentIndex = shortsList.length - 1; // loop
  }

  const vid = shortsList[currentIndex];
  loadPlayer(vid.id);
  updateInfo(vid.title, vid.channelTitle);
}

// Enable/disable nav buttons
function updateNavButtons() {
  const hasList = shortsList.length > 0;
  document.getElementById("prevBtn").disabled = !hasList;
  document.getElementById("nextBtn").disabled = !hasList;
}

// Touch swipe detection
document.addEventListener("touchstart", e => {
  if (!e.touches || !e.touches.length) return;
  startY = e.touches[0].clientY;
});

document.addEventListener("touchend", e => {
  if (!e.changedTouches || !e.changedTouches.length) return;
  const endY = e.changedTouches[0].clientY;
  const diff = startY - endY;

  if (Math.abs(diff) < 50) return;

  if (diff > 0) nextShort();
  else prevShort();
});

// Mouse wheel navigation
let wheelTimeout;
document.addEventListener("wheel", e => {
  clearTimeout(wheelTimeout);
  wheelTimeout = setTimeout(() => {
    if (e.deltaY > 0) nextShort();
    else prevShort();
  }, 80);
});
