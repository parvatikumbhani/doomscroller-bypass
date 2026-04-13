let player;
let shortsList = [];
let currentIndex = 0;

function onYouTubeIframeAPIReady() {
  loadPlayer("dQw4w9WgXcQ");
  updateInfo("Doomscroll Bypass – Desktop", "Your Channel");
}

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

function updateInfo(title, channel) {
  document.getElementById("videoTitle").textContent = title;
  document.getElementById("channelName").textContent = channel;
}

async function searchShorts() {
  const query = document.getElementById("searchBar").value.trim();
  if (!query) return;

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  shortsList = data.results || [];
  showResultsList(shortsList);
}

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
    };

    list.appendChild(item);
  });
}
