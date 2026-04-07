import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appleShowUrl =
  "https://podcasts.apple.com/us/podcast/bloody-water-podcast/id1554157578";
const appleLookupUrl =
  "https://itunes.apple.com/lookup?id=1554157578&entity=podcastEpisode&limit=200";
const spotifyShowUrl =
  "https://open.spotify.com/show/0GATqczYoMsnlcdYS1bvGX";
const redcircleFeedUrl =
  "https://feeds.redcircle.com/62a0c25c-90d4-44f5-bc2d-00adaec37398";
const youtubeChannelVideosUrl = "https://www.youtube.com/@BloodyWaterPodcast/videos";
const youtubeFeedUrl =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UC3n2yMqL5ZAHVR5-1FyN6IA";
const youtubeSearchLimit = Number(process.env.YOUTUBE_SEARCH_LIMIT ?? 0);
const titleStopWords = new Set([
  "and",
  "betting",
  "breakdown",
  "card",
  "fight",
  "main",
  "picks",
  "prediction",
  "predictions",
  "props",
  "show",
  "the",
  "ufc",
  "vs"
]);

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

function tokenizeTitle(value) {
  return normalizeTitle(value)
    .split(" ")
    .filter((token) => token.length > 1 && !titleStopWords.has(token));
}

function hasConflictingNumbers(left, right) {
  const leftNumbers = tokenizeTitle(left).filter((token) => /^\d+$/.test(token));
  const rightNumbers = tokenizeTitle(right).filter((token) => /^\d+$/.test(token));

  if (!leftNumbers.length || !rightNumbers.length) {
    return false;
  }

  return !leftNumbers.some((number) => rightNumbers.includes(number));
}

function titleSimilarity(left, right) {
  const leftTokens = new Set(tokenizeTitle(left));
  const rightTokens = new Set(tokenizeTitle(right));

  if (!leftTokens.size || !rightTokens.size) {
    return 0;
  }

  let shared = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      shared += 1;
    }
  }

  return shared / Math.max(leftTokens.size, rightTokens.size);
}

function buildYouTubeSearchUrl(title) {
  const query = `${title} Bloody Water Podcast`;

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
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

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }

  return response.json();
}

async function fetchOptionalText(url) {
  try {
    return await fetchText(url);
  } catch (error) {
    console.warn(`Skipping ${url}: ${error.message}`);
    return "";
  }
}

async function fetchOptionalJson(url) {
  try {
    return await fetchJson(url);
  } catch (error) {
    console.warn(`Skipping ${url}: ${error.message}`);
    return {};
  }
}

async function loadExistingLinks() {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    return {};
  }
}

function decodeHtml(value) {
  return value
    .replace(/&#x27;/g, "'")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#43;/g, "+")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseAppleLinks(html) {
  if (!html) {
    return {};
  }

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

function parseAppleLookupLinks(payload) {
  const episodes = payload.results?.filter((item) => item.kind === "podcast-episode") ?? [];

  return episodes.reduce((acc, episode) => {
    if (!episode?.trackName || !episode?.trackViewUrl) {
      return acc;
    }

    acc[normalizeTitle(episode.trackName)] = {
      appleUrl: episode.trackViewUrl
    };

    return acc;
  }, {});
}

function parseSpotifyLinks(html) {
  if (!html) {
    return {};
  }

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

function parseRedCircleTitles(xml) {
  if (!xml) {
    return [];
  }

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titles = [];
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const item = itemMatch[1];
    const rawTitle =
      item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
      item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ??
      "";
    const title = decodeHtml(rawTitle.trim());

    if (title) {
      titles.push(title);
    }
  }

  return titles;
}

function parseYouTubeChannelLinks(html) {
  if (!html) {
    return {};
  }

  const rendererRegex =
    /"videoId":"([^"]+)"[\s\S]{0,1400}?"title":\{"runs":\[\{"text":"([^"]+)"/g;
  const links = {};
  let match;

  while ((match = rendererRegex.exec(html)) !== null) {
    const [, videoId, rawTitle] = match;
    const title = decodeHtml(rawTitle.replace(/\\u0026/g, "&"));

    links[normalizeTitle(title)] = {
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
  }

  return links;
}

function parseYouTubeSearchLinks(html) {
  const videoIdRegex = /"videoId":"([^"]+)"/g;
  const links = {};
  const seenVideoIds = new Set();
  let match;

  while ((match = videoIdRegex.exec(html)) !== null) {
    const videoId = match[1];

    if (seenVideoIds.has(videoId)) {
      continue;
    }

    seenVideoIds.add(videoId);

    const resultBlock = html.slice(match.index, match.index + 2400);
    const rawTitle = resultBlock.match(/"title":\{"runs":\[\{"text":"([^"]+)"/)?.[1];
    const isBloodyWaterResult = resultBlock.includes('"text":"Bloody Water Podcast"');

    if (!rawTitle || !isBloodyWaterResult) {
      continue;
    }

    const title = decodeHtml(rawTitle.replace(/\\u0026/g, "&"));

    links[normalizeTitle(title)] = {
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
  }

  return links;
}

function parseYouTubeLinks(xml) {
  if (!xml) {
    return {};
  }

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

function findBestPlatformMatch(title, platformLinks, minimumScore = 0.42) {
  const exactKey = normalizeTitle(title);

  if (platformLinks[exactKey]) {
    return platformLinks[exactKey];
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const [candidateTitle, links] of Object.entries(platformLinks)) {
    if (hasConflictingNumbers(title, candidateTitle)) {
      continue;
    }

    const score = titleSimilarity(title, candidateTitle);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = links;
    }
  }

  return bestScore >= minimumScore ? bestMatch : null;
}

function findExactPlatformMatch(title, platformLinks) {
  return platformLinks[normalizeTitle(title)] ?? null;
}

async function buildYouTubeSearchLinks(feedTitles, existingYouTubeLinks) {
  const links = {};
  let searchCount = 0;

  for (const title of feedTitles) {
    if (searchCount >= youtubeSearchLimit) {
      break;
    }

    if (findBestPlatformMatch(title, existingYouTubeLinks, 0.58)) {
      continue;
    }

    let searchHtml = "";

    try {
      searchHtml = await fetchText(buildYouTubeSearchUrl(title));
      searchCount += 1;
    } catch (error) {
      console.warn(`Skipping YouTube search fallback after request failure: ${error.message}`);
      break;
    }

    const searchLinks = parseYouTubeSearchLinks(searchHtml);
    const match = findBestPlatformMatch(title, searchLinks, 0.45);

    if (match?.youtubeUrl) {
      links[normalizeTitle(title)] = match;
    }
  }

  return links;
}

function alignLinksToFeedTitles(feedTitles, { appleLinks, spotifyLinks, youtubeLinks }) {
  return feedTitles.reduce((acc, title) => {
    const appleMatch = findExactPlatformMatch(title, appleLinks);
    const spotifyMatch = findExactPlatformMatch(title, spotifyLinks);
    const youtubeMatch = findBestPlatformMatch(title, youtubeLinks, 0.58);
    const match = {
      ...(appleMatch ?? {}),
      ...(spotifyMatch ?? {}),
      ...(youtubeMatch ?? {})
    };

    if (!match.appleUrl && !match.spotifyUrl && !match.youtubeUrl) {
      return acc;
    }

    acc[normalizeTitle(title)] = match;
    return acc;
  }, {});
}

async function main() {
  const existingLinks = await loadExistingLinks();
  const [redcircleXml, appleHtml, appleLookupPayload, spotifyHtml, youtubeXml, youtubeChannelHtml] = await Promise.all([
    fetchOptionalText(redcircleFeedUrl),
    fetchOptionalText(appleShowUrl),
    fetchOptionalJson(appleLookupUrl),
    fetchOptionalText(spotifyShowUrl),
    fetchOptionalText(youtubeFeedUrl),
    fetchOptionalText(youtubeChannelVideosUrl)
  ]);

  const feedTitles = parseRedCircleTitles(redcircleXml);
  const appleLinks = {
    ...parseAppleLinks(appleHtml),
    ...parseAppleLookupLinks(appleLookupPayload)
  };
  const spotifyLinks = parseSpotifyLinks(spotifyHtml);
  const youtubeLinks = {
    ...parseYouTubeLinks(youtubeXml),
    ...parseYouTubeChannelLinks(youtubeChannelHtml)
  };
  const youtubeSearchLinks = await buildYouTubeSearchLinks(feedTitles, youtubeLinks);
  const merged = alignLinksToFeedTitles(feedTitles, {
    appleLinks,
    spotifyLinks,
    youtubeLinks: {
      ...youtubeLinks,
      ...youtubeSearchLinks
    }
  });
  const outputLinks = {
    ...existingLinks,
    ...merged
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(outputLinks, null, 2)}\n`, "utf8");

  console.log(
    `Wrote ${Object.keys(outputLinks).length} episode platform link entries to ${outputPath}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
