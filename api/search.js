export default async function handler(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  const apiKey = process.env.YT_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing YT_API_KEY env variable" });
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(
    query
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      return res.status(500).json({ error: "Invalid YouTube API response", raw: data });
    }

    const results = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle
    }));

    res.status(200).json({ results });
  } catch (err) {
    console.error("YouTube API error:", err);
    res.status(500).json({ error: "YouTube API error" });
  }
}
