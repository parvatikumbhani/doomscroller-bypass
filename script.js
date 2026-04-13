let player;
let shortsList = [];
let currentIndex = 0;
let startY = 0;

// YouTube API callback
function onYouTubeIframeAPIReady() {
  loadPlayer("dQw4w9WgXcQ");
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

// Show YouTube-style search results
function showResultsList(videos) {
  const list = document.getElementById("resultsList");
  list.innerHTML = "";

  videos.forEach((v, index) => {
    const item = document.createElement("div");
    item.className = "result-item";

    item.innerHTML = `
      <img class="result-thumb" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg">
      <div class="result-info">
        <div class="result-title">${v.title}</div>
        <div class="result-channel">${v.channelTitle}</div>
      </div>
    `;

    item.onclick = () => {
      currentIndex = index;
      loadPlayer(v.id);
      updateInfo(v.title, v.channelTitle);
      list.innerHTML = "";
    };

    list.appendChild(item);
  });
}

// Search videos
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

    showResultsList(shortsList);

  } catch (e) {
    console.error("Search error:", e);
  }
}

// Next video
function nextShort() {
  if (!shortsList.length) return;

  currentIndex = (currentIndex + 1) % shortsList.length;

  const vid = shortsList[currentIndex];
  loadPlayer(vid.id);
  updateInfo(vid.title, vid.channelTitle);
}

// Previous video
function prevShort() {
  if (!shortsList.length) return;

  currentIndex = (currentIndex - 1 + shortsList.length) % shortsList.length;

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

// Touch swipe
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
