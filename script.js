const feedUrl = "https://feeds.redcircle.com/62a0c25c-90d4-44f5-bc2d-00adaec37398";
const platformLinksUrl = "./data/platform-links.json";
const showLinks = [
  {
    label: "Spotify",
    href: "https://open.spotify.com/show/0GATqczYoMsnlcdYS1bvGX",
    primary: true
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

let episodes = fallbackEpisodes;

const recentFeature = document.getElementById("recent-feature");
const episodeList = document.getElementById("episode-list");
const emptyState = document.getElementById("empty-state");
const archiveStatus = document.getElementById("archive-status");
const searchInput = document.getElementById("episode-search");
const archiveCards = document.querySelectorAll(".archive-card");
const panels = document.querySelectorAll(".episode-panel");
const recentArchiveCard = document.getElementById("recent-archive-card");
const heroSection = document.getElementById("home-hero");
const episodesSection = document.querySelector(".episodes-section");
const detailView = document.getElementById("episode-detail-view");
const detailCard = document.getElementById("episode-detail-card");
const detailBack = document.getElementById("detail-back");
const aboutSection = document.getElementById("about");
const listenSection = document.getElementById("listen");
const latestListenCard = document.getElementById("latest-listen-card");
const showLinksContainer = document.getElementById("show-links");

function renderRecentEpisode() {
  const episode = episodes[0];

  recentFeature.innerHTML = `
    <div class="recent-feature-copy">
      <p class="eyebrow">${episode.category}</p>
      <h3>${episode.title}</h3>
      <p>${episode.summary}</p>
      <div class="recent-meta">
        <span>Episode ${episode.id}</span>
        <span>${episode.length}</span>
        <span>${episode.date}</span>
      </div>
      <div class="episode-card-actions">
        <a class="episode-action episode-action-primary" href="#/episodes/${episode.slug}">
          View episode
        </a>
      </div>
    </div>
    <div class="recent-feature-art-wrap">
      <img class="recent-feature-art" src="${episode.imageUrl || "./assets/logo-dark.png"}" alt="Artwork for Episode ${episode.id}" />
    </div>
  `;
}

function renderArchiveCards() {
  const episode = episodes[0];

  recentArchiveCard.innerHTML = `
    <span class="archive-card-label">Recent Episode</span>
    <span class="archive-card-copy">
      Episode ${episode.id}: ${episode.title}
    </span>
    <div class="archive-card-meta">
      <span>${episode.date}</span>
      <span>${episode.length}</span>
    </div>
  `;
}

function renderShowLinks() {
  showLinksContainer.innerHTML = showLinks
    .map(
      (link) => `
        <a
          class="show-link${link.primary ? " show-link-primary" : ""}"
          href="${link.href}"
          target="_blank"
          rel="noreferrer"
        >
          ${link.label}
        </a>
      `
    )
    .join("");
}

function renderListenSection() {
  const episode = episodes[0];
  const primaryListenUrl = episode.spotifyUrl || episode.appleUrl || episode.externalLink || "#/episodes/${episode.slug}";
  const primaryListenLabel = episode.spotifyUrl
    ? "Listen on Spotify"
    : episode.appleUrl
      ? "Listen on Apple Podcasts"
      : episode.externalLink
        ? "Watch on YouTube"
        : "Open episode";

  latestListenCard.innerHTML = `
    <p class="card-label">Latest Episode</p>
    <h3 class="latest-listen-title">Episode ${episode.id}: ${episode.title}</h3>
    <p class="latest-listen-summary">${episode.summary}</p>
    <div class="latest-listen-meta">
      <span>${episode.date}</span>
      <span>${episode.length}</span>
    </div>
    <div class="listen-actions">
      <a
        class="listen-action listen-action-primary"
        href="${primaryListenUrl}"
        ${primaryListenUrl.startsWith("#") ? "" : 'target="_blank" rel="noreferrer"'}
      >
        ${primaryListenLabel}
      </a>
      <a class="listen-action" href="#/episodes/${episode.slug}">
        Read episode page
      </a>
    </div>
  `;
}

function createEpisodeMarkup(episode) {
  return `
    <article class="episode-card">
      <a class="episode-card-link" href="#/episodes/${episode.slug}" data-episode-link="${episode.slug}">
        <span class="episode-tag">${episode.category}</span>
        <h3 class="episode-card-title">Episode ${episode.id}: ${episode.title}</h3>
        <p>${episode.summary}</p>
        <div class="episode-card-footer">
          <span>${episode.length}</span>
          <span>${episode.date}</span>
        </div>
      </a>
      <div class="episode-card-actions">
        <a class="episode-action episode-action-primary" href="#/episodes/${episode.slug}" data-episode-link="${episode.slug}">
          View episode
        </a>
      </div>
    </article>
  `;
}

function renderEpisodeList(query = "") {
  const normalizedQuery = query.trim().toLowerCase();

  const filteredEpisodes = episodes.filter((episode) => {
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      episode.title,
      episode.summary,
      episode.category,
      ...episode.keywords
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  episodeList.innerHTML = filteredEpisodes.map(createEpisodeMarkup).join("");
  emptyState.classList.toggle("is-hidden", filteredEpisodes.length > 0);
  archiveStatus.textContent = filteredEpisodes.length
    ? `Showing ${filteredEpisodes.length} episode${filteredEpisodes.length === 1 ? "" : "s"} from the Bloody Water archive.`
    : "No episodes match that search yet.";
}

function setActiveTab(filter) {
  archiveCards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.filter === filter);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.panel !== filter);
  });
}

archiveCards.forEach((card) => {
  card.addEventListener("click", () => {
    setActiveTab(card.dataset.filter);
  });
});

searchInput.addEventListener("input", (event) => {
  const query = event.target.value;
  renderEpisodeList(query);

  if (query.trim()) {
    setActiveTab("all");
  }
});

renderRecentEpisode();
renderArchiveCards();
renderEpisodeList();
renderShowLinks();
renderListenSection();

detailBack.addEventListener("click", () => {
  window.location.hash = "";
});

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
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
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

function buildPlatformMarkup(episode) {
  const links = [
    episode.spotifyUrl
      ? `<a class="platform-link" href="${episode.spotifyUrl}" target="_blank" rel="noreferrer">Spotify</a>`
      : "",
    episode.appleUrl
      ? `<a class="platform-link" href="${episode.appleUrl}" target="_blank" rel="noreferrer">Apple Podcasts</a>`
      : ""
  ]
    .filter(Boolean)
    .join("");

  return links ? `<div class="platform-links">${links}</div>` : "";
}

function renderEpisodeDetail(episode) {
  detailCard.innerHTML = `
    <p class="episode-detail-date">${episode.date}</p>
    <h1 class="episode-detail-title">Episode ${episode.id}: ${episode.title}</h1>
    <div class="episode-detail-media">
      ${episode.imageUrl ? `<img class="episode-detail-art" src="${episode.imageUrl}" alt="Artwork for Episode ${episode.id}" />` : ""}
      ${buildPlatformMarkup(episode)}
      ${episode.audioUrl ? `<audio class="episode-audio" controls preload="metadata" src="${episode.audioUrl}"></audio>` : ""}
    </div>
    <div class="detail-divider"></div>
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
    listenSection.classList.remove("is-hidden");
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
  listenSection.classList.add("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("hashchange", renderRoute);

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
        month: "long",
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
    renderArchiveCards();
    renderEpisodeList(searchInput.value);
    renderListenSection();
    renderRoute();
  } catch (error) {
    archiveStatus.textContent = "Live feed unavailable right now. Showing placeholder episodes.";
    console.error(error);
  }
}

loadEpisodesFromFeed();
renderRoute();
