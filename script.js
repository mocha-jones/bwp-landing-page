const feedUrl = "https://feeds.redcircle.com/62a0c25c-90d4-44f5-bc2d-00adaec37398";
const platformLinksUrl = "./data/platform-links.json";

const fallbackEpisodes = [
  {
    id: 128,
    guid: "fallback-128",
    slug: "episode-128-the-night-shift-story-everyone-thought-they-knew",
    title: "The Night Shift Story Everyone Thought They Knew",
    summary:
      "A hospital corridor, one missing hour, and witness statements that do not line up once the timeline gets rebuilt.",
    fullSummary:
      "A hospital corridor, one missing hour, and witness statements that do not line up once the timeline gets rebuilt.",
    category: "Recent Episode",
    length: "52 min",
    date: "April 4, 2026",
    audioUrl: "",
    imageUrl: "./assets/logo-dark.png",
    externalLink: "https://www.youtube.com/@BloodyWaterPodcast?sub_confirmation=1",
    keywords: ["timeline", "hospital", "investigation"]
  },
  {
    id: 127,
    guid: "fallback-127",
    slug: "episode-127-the-chef-the-critic-and-the-locked-wine-cellar",
    title: "The Chef, the Critic, and the Locked Wine Cellar",
    summary:
      "A dinner service turns into a case file when a celebrated tasting menu night ends with a disappearance.",
    fullSummary:
      "A dinner service turns into a case file when a celebrated tasting menu night ends with a disappearance.",
    category: "Investigation",
    length: "48 min",
    date: "March 28, 2026",
    audioUrl: "",
    imageUrl: "./assets/logo-dark.png",
    externalLink: "https://www.youtube.com/@BloodyWaterPodcast?sub_confirmation=1",
    keywords: ["restaurant", "disappearance", "critics"]
  },
  {
    id: 126,
    guid: "fallback-126",
    slug: "episode-126-what-the-apartment-camera-captured-at-3-12-am",
    title: "What the Apartment Camera Captured at 3:12 A.M.",
    summary:
      "One grainy frame changed the theory of the case, but only after a tenant noticed what police missed.",
    fullSummary:
      "One grainy frame changed the theory of the case, but only after a tenant noticed what police missed.",
    category: "Mystery",
    length: "61 min",
    date: "March 21, 2026",
    audioUrl: "",
    imageUrl: "./assets/logo-dark.png",
    externalLink: "https://www.youtube.com/@BloodyWaterPodcast?sub_confirmation=1",
    keywords: ["camera", "apartment", "security"]
  },
  {
    id: 125,
    guid: "fallback-125",
    slug: "episode-125-the-reunion-invitation-that-reopened-everything",
    title: "The Reunion Invitation That Reopened Everything",
    summary:
      "A seemingly harmless message brings former classmates back into a story buried for over a decade.",
    fullSummary:
      "A seemingly harmless message brings former classmates back into a story buried for over a decade.",
    category: "Longform",
    length: "56 min",
    date: "March 14, 2026",
    audioUrl: "",
    imageUrl: "./assets/logo-dark.png",
    externalLink: "https://www.youtube.com/@BloodyWaterPodcast?sub_confirmation=1",
    keywords: ["reunion", "classmates", "cold case"]
  },
  {
    id: 124,
    guid: "fallback-124",
    slug: "episode-124-inside-the-small-town-rumor-that-became-evidence",
    title: "Inside the Small Town Rumor That Became Evidence",
    summary:
      "A local whisper network turns out to have been preserving critical details all along.",
    fullSummary:
      "A local whisper network turns out to have been preserving critical details all along.",
    category: "Small Town",
    length: "43 min",
    date: "March 7, 2026",
    audioUrl: "",
    imageUrl: "./assets/logo-dark.png",
    externalLink: "https://www.youtube.com/@BloodyWaterPodcast?sub_confirmation=1",
    keywords: ["rumor", "town", "evidence"]
  },
  {
    id: 123,
    guid: "fallback-123",
    slug: "episode-123-the-last-delivery-on-birch-street",
    title: "The Last Delivery on Birch Street",
    summary:
      "A routine doorstep drop becomes the final confirmed sighting in a case that kept shifting shape.",
    fullSummary:
      "A routine doorstep drop becomes the final confirmed sighting in a case that kept shifting shape.",
    category: "Case File",
    length: "50 min",
    date: "February 28, 2026",
    audioUrl: "",
    imageUrl: "./assets/logo-dark.png",
    externalLink: "https://www.youtube.com/@BloodyWaterPodcast?sub_confirmation=1",
    keywords: ["delivery", "street", "sighting"]
  }
];

const showLinks = [
  {
    label: "Spotify",
    href: "https://open.spotify.com/show/0GATqczYoMsnlcdYS1bvGX"
  },
  {
    label: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/bloody-water-podcast/id1554157578"
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@BloodyWaterPodcast?sub_confirmation=1"
  }
];

let episodes = fallbackEpisodes;

const recentFeature = document.getElementById("recent-feature");
const episodeList = document.getElementById("episode-list");
const archiveStatus = document.getElementById("archive-status");
const heroSection = document.getElementById("home-hero");
const episodesSection = document.querySelector(".episodes-section");
const detailView = document.getElementById("episode-detail-view");
const detailCard = document.getElementById("episode-detail-card");
const detailBack = document.getElementById("detail-back");
const aboutSection = document.getElementById("about");

function decodeHtmlEntities(value) {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(value, "text/html");

  return htmlDoc.documentElement.textContent || "";
}

function stripHtml(value) {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(value, "text/html");

  return htmlDoc.body.textContent || "";
}

function truncateText(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

function normalizeDescription(rawValue) {
  const decoded = decodeHtmlEntities(rawValue || "");
  const withoutHtml = stripHtml(decoded)
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .trim();

  if (!withoutHtml) {
    return "";
  }

  const beforeTimestamps = withoutHtml.split(/timestamps?\s*(below|:)/i)[0];
  const lines = beforeTimestamps
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^[a-z0-9'’().,\-\/& ]+:\s*\d{1,2}:\d{2}(?::\d{2})?$/i.test(line));

  return lines.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildPrimarySummary(value) {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.slice(0, 2).join(" ");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeTitle(value) {
  return value
    .toLowerCase()
    .replace(/&#x27;/g, "'")
    .replace(/[’']/g, "")
    .replace(/\bx27\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatDuration(value) {
  if (!/^\d+$/.test(value)) {
    return value || "Podcast";
  }

  const totalSeconds = Number(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatParagraphs(value) {
  const text = value.trim();

  if (!text) {
    return "<p>Episode notes coming soon.</p>";
  }

  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
}

function createShowLinksMarkup() {
  return showLinks
    .map(
      (link) => `
        <a class="platform-link" href="${link.href}" target="_blank" rel="noreferrer">
          ${link.label}
        </a>
      `
    )
    .join("");
}

function buildFeatureActions(episode) {
  const primaryUrl = episode.spotifyUrl || episode.appleUrl || episode.externalLink || `#/episodes/${episode.slug}`;
  const primaryLabel = episode.spotifyUrl
    ? "Listen on Spotify"
    : episode.appleUrl
      ? "Listen on Apple Podcasts"
      : episode.externalLink
        ? "Watch on YouTube"
        : "Open episode";

  return `
    <div class="featured-actions">
      <a
        class="action-link action-link-primary"
        href="${primaryUrl}"
        ${primaryUrl.startsWith("#") ? "" : 'target="_blank" rel="noreferrer"'}
      >
        ${primaryLabel}
      </a>
      <a class="action-link" href="#/episodes/${episode.slug}">
        Episode page
      </a>
    </div>
  `;
}

function renderRecentEpisode() {
  const episode = episodes[0];

  recentFeature.innerHTML = `
    <div class="featured-media">
      <img
        class="featured-art"
        src="${episode.imageUrl || "./assets/logo-dark.png"}"
        alt="Artwork for Episode ${episode.id}"
      />
    </div>
    <div class="featured-content">
      <p class="episode-row-meta">
        <span>${episode.date}</span>
        <span>${episode.length}</span>
      </p>
      <h1 class="featured-title">Episode ${episode.id}: ${episode.title}</h1>
      <p class="featured-summary">${episode.summary}</p>
      ${buildFeatureActions(episode)}
      <div class="platform-links">
        ${createShowLinksMarkup()}
      </div>
    </div>
  `;
}

function createEpisodeMarkup(episode) {
  return `
    <article class="episode-row">
      <a class="episode-row-link" href="#/episodes/${episode.slug}" data-episode-link="${episode.slug}">
        <div class="episode-row-main">
          <span class="episode-row-title">Episode ${episode.id}: ${episode.title}</span>
          <span class="episode-row-arrow">View</span>
        </div>
        <div class="episode-row-meta">
          <span>${episode.date}</span>
          <span>${episode.length}</span>
        </div>
      </a>
    </article>
  `;
}

function renderEpisodeList() {
  episodeList.innerHTML = episodes.map(createEpisodeMarkup).join("");
  archiveStatus.textContent = `Showing ${episodes.length} recent episode${episodes.length === 1 ? "" : "s"}.`;
}

function buildPlatformMarkup(episode) {
  const links = [
    episode.spotifyUrl
      ? `<a class="platform-link" href="${episode.spotifyUrl}" target="_blank" rel="noreferrer">Spotify</a>`
      : "",
    episode.appleUrl
      ? `<a class="platform-link" href="${episode.appleUrl}" target="_blank" rel="noreferrer">Apple Podcasts</a>`
      : "",
    episode.externalLink
      ? `<a class="platform-link" href="${episode.externalLink}" target="_blank" rel="noreferrer">YouTube</a>`
      : ""
  ]
    .filter(Boolean)
    .join("");

  return links;
}

function renderEpisodeDetail(episode) {
  detailCard.innerHTML = `
    <p class="episode-detail-date">${episode.date}</p>
    <h1 class="episode-detail-title">Episode ${episode.id}: ${episode.title}</h1>
    <div class="episode-detail-meta">
      <span>${episode.length}</span>
      <span>${episode.category}</span>
    </div>
    ${
      episode.imageUrl
        ? `<img class="episode-detail-art" src="${episode.imageUrl}" alt="Artwork for Episode ${episode.id}" />`
        : ""
    }
    ${
      buildPlatformMarkup(episode)
        ? `<div class="episode-detail-actions">${buildPlatformMarkup(episode)}</div>`
        : ""
    }
    ${
      episode.audioUrl
        ? `<audio class="episode-audio" controls preload="metadata" src="${episode.audioUrl}"></audio>`
        : ""
    }
    <div class="episode-detail-body">
      ${formatParagraphs(episode.fullSummary)}
    </div>
  `;
}

function renderRoute() {
  const match = window.location.hash.match(/^#\/episodes\/(.+)$/);

  if (!match) {
    detailView.classList.add("is-hidden");
    heroSection.classList.remove("is-hidden");
    episodesSection.classList.remove("is-hidden");
    aboutSection.classList.remove("is-hidden");
    return;
  }

  const [, slug] = match;
  const episode = episodes.find((item) => item.slug === slug);

  if (!episode) {
    window.location.hash = "";
    return;
  }

  renderEpisodeDetail(episode);
  detailView.classList.remove("is-hidden");
  heroSection.classList.add("is-hidden");
  episodesSection.classList.add("is-hidden");
  aboutSection.classList.add("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("hashchange", renderRoute);

detailBack.addEventListener("click", () => {
  window.location.hash = "";
});

function parseEpisodeItem(item) {
  const title = item.querySelector("title")?.textContent?.trim() || "Untitled episode";
  const rawSummary =
    item.querySelector("itunes\\:summary, summary")?.textContent?.trim() ||
    item.querySelector("description")?.textContent?.trim() ||
    "";
  const cleanDescription = normalizeDescription(rawSummary);
  const primarySummary = buildPrimarySummary(cleanDescription);
  const episodeNumber = item.querySelector("itunes\\:episode, episode")?.textContent?.trim() || "";
  const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";
  const enclosure = item.querySelector("enclosure");
  const duration =
    item.querySelector("itunes\\:duration, duration")?.textContent?.trim() || "Podcast";
  const date = pubDate
    ? new Date(pubDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "Date unavailable";

  return {
    id: episodeNumber || "Episode",
    guid: item.querySelector("guid")?.textContent?.trim() || title,
    slug: slugify(`${episodeNumber || "episode"}-${title}`),
    title,
    summary: truncateText(primarySummary || cleanDescription, 220),
    fullSummary: cleanDescription || "Episode notes coming soon.",
    category: "Bloody Water Archive",
    length: formatDuration(duration),
    date,
    audioUrl: enclosure?.getAttribute("url") || "",
    imageUrl: item.querySelector("itunes\\:image, image")?.getAttribute("href") || "",
    externalLink: item.querySelector("link")?.textContent?.trim() || "",
    keywords: [title, cleanDescription]
  };
}

async function loadPlatformLinks() {
  try {
    const response = await fetch(platformLinksUrl);

    if (!response.ok) {
      throw new Error(`Platform links request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(error);
    return {};
  }
}

function mergePlatformLinks(episodeItems, linkMap) {
  return episodeItems.map((episode) => {
    const match = linkMap[normalizeTitle(episode.title)] || {};

    return {
      ...episode,
      appleUrl: match.appleUrl || "",
      spotifyUrl: match.spotifyUrl || ""
    };
  });
}

async function loadEpisodesFromFeed() {
  try {
    archiveStatus.textContent = "Loading episodes from RedCircle...";

    const [response, linkMap] = await Promise.all([
      fetch(feedUrl),
      loadPlatformLinks()
    ]);

    if (!response.ok) {
      throw new Error(`Feed request failed with status ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");
    const items = Array.from(xml.querySelectorAll("item"));
    const parsedEpisodes = mergePlatformLinks(
      items.map(parseEpisodeItem).filter((episode) => episode.audioUrl),
      linkMap
    );

    if (!parsedEpisodes.length) {
      throw new Error("No episodes were found in the feed.");
    }

    episodes = parsedEpisodes;
    renderRecentEpisode();
    renderEpisodeList();
    renderRoute();
  } catch (error) {
    archiveStatus.textContent = "Live feed unavailable right now. Showing placeholder episodes.";
    console.error(error);
  }
}

renderRecentEpisode();
renderEpisodeList();
renderRoute();
loadEpisodesFromFeed();
