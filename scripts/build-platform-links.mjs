import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appleShowUrl =
  "https://podcasts.apple.com/us/podcast/bloody-water-podcast/id1554157578";
const spotifyShowUrl =
  "https://open.spotify.com/show/0GATqczYoMsnlcdYS1bvGX";
const youtubeFeedUrl =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UC3n2yMqL5ZAHVR5-1FyN6IA";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const outputPath = path.join(dataDir, "platform-links.json");

function normalizeTitle(value) {
  return value
    .toLowerCase()
    .replace(/&#x27;/g, "'")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[’']/g, "")
    .replace(/\bx27\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }

  return response.text();
}

function decodeHtml(value) {
  return value
    .replace(/&#x27;/g, "'")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseAppleLinks(html) {
  const match = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/
  );

  if (!match) {
    throw new Error("Apple JSON-LD payload not found.");
  }

  const payload = JSON.parse(match[1]);
  const episodes = payload.workExample ?? [];

  return episodes.reduce((acc, episode) => {
    if (!episode?.name || !episode?.url) {
      return acc;
    }

    acc[normalizeTitle(episode.name)] = {
      appleUrl: episode.url
    };

    return acc;
  }, {});
}

function parseSpotifyLinks(html) {
  const regex =
    /<a href="\/episode\/([^"]+)"><h4[^>]*>([\s\S]*?)<\/h4><\/a>/g;
  const links = {};
  let match;

  while ((match = regex.exec(html)) !== null) {
    const [, episodeId, rawName] = match;
    const name = decodeHtml(rawName.replace(/<[^>]+>/g, ""));

    links[normalizeTitle(name)] = {
      spotifyUrl: `https://open.spotify.com/episode/${episodeId}`
    };
  }

  return links;
}

function parseYouTubeLinks(xml) {
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const links = {};
  let entryMatch;

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const href = entry.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/)?.[1];

    if (!title || !href || !/youtube\.com\/watch\?v=/i.test(href)) {
      continue;
    }

    links[normalizeTitle(decodeHtml(title))] = {
      youtubeUrl: href
    };
  }

  return links;
}

function mergeLinks(appleLinks, spotifyLinks, youtubeLinks) {
  const keys = new Set([
    ...Object.keys(appleLinks),
    ...Object.keys(spotifyLinks),
    ...Object.keys(youtubeLinks)
  ]);
  const merged = {};

  for (const key of keys) {
    merged[key] = {
      ...(appleLinks[key] ?? {}),
      ...(spotifyLinks[key] ?? {}),
      ...(youtubeLinks[key] ?? {})
    };
  }

  return merged;
}

async function main() {
  const [appleHtml, spotifyHtml, youtubeXml] = await Promise.all([
    fetchText(appleShowUrl),
    fetchText(spotifyShowUrl),
    fetchText(youtubeFeedUrl)
  ]);

  const appleLinks = parseAppleLinks(appleHtml);
  const spotifyLinks = parseSpotifyLinks(spotifyHtml);
  const youtubeLinks = parseYouTubeLinks(youtubeXml);
  const merged = mergeLinks(appleLinks, spotifyLinks, youtubeLinks);

  await mkdir(dataDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

  console.log(
    `Wrote ${Object.keys(merged).length} episode platform link entries to ${outputPath}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
