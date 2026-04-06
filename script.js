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

let episodes = fallbackEpisodes;
let archiveQuery = "";

const recentEntryCopy = document.getElementById("recent-entry-copy");
const archiveStatus = document.getElementById("archive-status");
const archiveGrid = document.getElementById("archive-grid");
const archiveSearchInput = document.getElementById("archive-search-input");
const landingView = document.getElementById("landing-view");
const archiveView = document.getElementById("archive-view");
const detailView = document.getElementById("episode-detail-view");
const detailCard = document.getElementById("episode-detail-card");

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

function formatDisplayDate(value) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatArchiveDate(value) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit"
  });
}

function getEpisodeDisplayLabel(episode) {
  const rawId = String(episode.id || "").trim();

  if (!rawId || rawId.toLowerCase() === "episode") {
    return episode.title;
  }

  return `#${rawId} ${episode.title}`;
}

function getEpisodeDetailTitleMarkup(episode) {
  const rawId = String(episode.id || "").trim();

  if (!rawId || rawId.toLowerCase() === "episode") {
    return episode.title;
  }

  return `<span class="episode-detail-number">#${rawId}</span><span class="episode-detail-title-text">${episode.title}</span>`;
}

function renderLanding() {
  const episode = episodes[0];
  const playUrl = episode.audioUrl ? `#/episodes/${episode.slug}` : "#recent";

  recentEntryCopy.innerHTML = `
    <p class="entry-title">${getEpisodeDisplayLabel(episode)}</p>
    <div class="entry-meta">
      <span>${formatDisplayDate(episode.date)}</span>
      <span>${episode.length}</span>
    </div>
    <div class="entry-actions">
      <a class="entry-button entry-button-primary" href="${playUrl}">Open Latest Episode</a>
    </div>
  `;
}

function hasEpisodeDestination(episode, index) {
  if (index === 0) {
    return true;
  }

  return Boolean(episode.spotifyUrl || episode.appleUrl || getEpisodeYouTubeUrl(episode));
}

function getVisibleEpisodes() {
  return episodes.filter((episode, index) => hasEpisodeDestination(episode, index));
}

function buildArchiveIconLink(href, label, icon) {
  if (!href) {
    return "";
  }

  return `
    <a class="archive-icon-link" href="${href}" target="_blank" rel="noreferrer" aria-label="${label}">
      ${icon}
    </a>
  `;
}

function getEpisodeYouTubeUrl(episode) {
  if (episode.youtubeUrl) {
    return episode.youtubeUrl;
  }

  return /youtube\.com|youtu\.be/i.test(episode.externalLink || "") ? episode.externalLink : "";
}

function buildArchivePlatformMarkup(episode) {
  const spotifyIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Zm4.82 15.13a.75.75 0 0 1-1.03.25c-2.84-1.74-6.42-2.13-10.65-1.18a.75.75 0 1 1-.33-1.47c4.62-1.04 8.58-.58 11.77 1.37.35.21.46.67.24 1.03Zm1.47-3.26a.94.94 0 0 1-1.29.31c-3.25-2-8.21-2.58-12.05-1.42a.94.94 0 1 1-.54-1.8c4.36-1.31 9.78-.67 13.57 1.66.44.27.58.85.31 1.29Zm.13-3.39C14.52 7.66 8.03 7.44 4.36 8.56a1.13 1.13 0 1 1-.66-2.16c4.21-1.29 11.22-1.04 15.9 1.74a1.13 1.13 0 0 1-1.18 1.94Z"/>
    </svg>
  `;
  const appleIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.98 3.25a1.55 1.55 0 1 1 0 3.1 1.55 1.55 0 0 1 0-3.1Zm0 4.58a4.17 4.17 0 0 0-4.17 4.17v.75a.9.9 0 1 0 1.8 0V12a2.37 2.37 0 1 1 4.74 0v.75a.9.9 0 1 0 1.8 0V12a4.17 4.17 0 0 0-4.17-4.17Zm0 6.1a2.07 2.07 0 1 0 0 4.14 2.07 2.07 0 0 0 0-4.14Zm0 1.5a.57.57 0 1 1 0 1.14.57.57 0 0 1 0-1.14Z"/>
      <path d="M11.98 0C5.37 0 0 5.37 0 11.98s5.37 11.98 11.98 11.98 11.98-5.37 11.98-11.98S18.6 0 11.98 0Zm0 21.96c-5.5 0-9.98-4.48-9.98-9.98S6.48 2 11.98 2s9.98 4.48 9.98 9.98-4.48 9.98-9.98 9.98Z"/>
    </svg>
  `;
  const youtubeIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.3 7.2a2.85 2.85 0 0 0-2-2c-1.77-.47-8.88-.47-8.88-.47s-7.1 0-8.88.47a2.85 2.85 0 0 0-2 2A29.7 29.7 0 0 0-.02 12a29.7 29.7 0 0 0 .46 4.8 2.85 2.85 0 0 0 2 2c1.78.47 8.88.47 8.88.47s7.11 0 8.88-.47a2.85 2.85 0 0 0 2-2 29.69 29.69 0 0 0 .47-4.8 29.69 29.69 0 0 0-.47-4.8ZM9.57 15.07V8.93L14.98 12l-5.41 3.07Z"/>
    </svg>
  `;

  return [
    buildArchiveIconLink(getEpisodeYouTubeUrl(episode), "YouTube", youtubeIcon),
    buildArchiveIconLink(episode.appleUrl, "Apple Podcasts", appleIcon),
    buildArchiveIconLink(episode.spotifyUrl, "Spotify", spotifyIcon)
  ]
    .filter(Boolean)
    .join("");
}

function createArchiveCardMarkup(episode) {
  const summary = truncateText(episode.summary || episode.fullSummary || "", 150);

  return `
    <article class="archive-card">
      <a class="archive-card-media" href="#/episodes/${episode.slug}">
        <img
          class="archive-card-image"
          src="${episode.imageUrl || "./assets/logo-dark.png"}"
          alt="Artwork for Episode ${episode.id}"
          loading="lazy"
        />
        <span class="archive-card-play" aria-hidden="true"></span>
      </a>
      <div class="archive-card-content">
        <p class="archive-card-date">${formatArchiveDate(episode.date)}</p>
        <a href="#/episodes/${episode.slug}">
          <h2 class="archive-card-title">${getEpisodeDisplayLabel(episode)}</h2>
        </a>
        <p class="archive-card-summary">${summary}</p>
        <div class="archive-card-actions">
          <a class="archive-card-link" href="#/episodes/${episode.slug}">Open Episode</a>
          <div class="archive-card-platforms">
            ${buildArchivePlatformMarkup(episode)}
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderArchiveGrid() {
  const visibleEpisodes = getVisibleEpisodes();
  const query = archiveQuery.trim().toLowerCase();
  const filteredEpisodes = query
    ? visibleEpisodes.filter((episode) =>
        [episode.title, episode.summary, episode.fullSummary, String(episode.id)]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      )
    : visibleEpisodes;

  archiveGrid.innerHTML = filteredEpisodes.map(createArchiveCardMarkup).join("");

  if (!filteredEpisodes.length) {
    archiveStatus.textContent = `No episodes found for "${archiveQuery}".`;
    archiveGrid.innerHTML = "";
    return;
  }

  archiveStatus.textContent = `Showing ${filteredEpisodes.length} linked episode${filteredEpisodes.length === 1 ? "" : "s"}.`;
}

function buildPlatformLogoLink(href, label, logoClass, logoSrc) {
  if (!href) {
    return "";
  }

  return `
    <a class="platform-button ${logoClass}" href="${href}" target="_blank" rel="noreferrer" aria-label="${label}">
      <img class="platform-button-logo" src="${logoSrc}" alt="${label}" />
    </a>
  `;
}

function buildPlatformMarkup(episode) {
  const links = [
    buildPlatformLogoLink(episode.spotifyUrl, "Spotify", "platform-button-spotify", "./assets/spotify-logo-white.svg"),
    buildPlatformLogoLink(episode.appleUrl, "Apple Podcasts", "platform-button-apple", "./assets/apple-podcasts-logo-white.svg"),
    buildPlatformLogoLink(getEpisodeYouTubeUrl(episode), "YouTube", "platform-button-youtube", "./assets/youtube-logo-white.png")
  ]
    .filter(Boolean)
    .join("");

  return links;
}

function formatPlayerTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getYouTubeEmbedUrl(episode) {
  const url = getEpisodeYouTubeUrl(episode);

  if (!url) {
    return "";
  }

  const watchMatch = url.match(/[?&]v=([^&]+)/i);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/i);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  const shareMatch = url.match(/youtu\.be\/([^?&/]+)/i);
  if (shareMatch) {
    return `https://www.youtube.com/embed/${shareMatch[1]}`;
  }

  return "";
}

function renderEpisodeDetail(episode) {
  const embedUrl = getYouTubeEmbedUrl(episode);

  detailCard.innerHTML = `
    <p class="episode-detail-date">${episode.date}</p>
    <h1 class="episode-detail-title">${getEpisodeDetailTitleMarkup(episode)}</h1>
    <div class="episode-detail-meta">
      <span>${episode.length}</span>
      <span>${episode.category}</span>
    </div>
    ${
      episode.audioUrl
        ? `
          <div class="episode-player">
            <div class="episode-player-bar">
              <button class="episode-player-toggle" type="button" aria-label="Play episode">Play</button>
              <div class="episode-player-copy">
                <span class="episode-player-kicker">Audio</span>
                <span class="episode-player-name">${getEpisodeDisplayLabel(episode)}</span>
              </div>
              <div class="episode-player-time">
                <span class="episode-player-current">0:00</span>
                <span class="episode-player-separator">/</span>
                <span class="episode-player-duration">${episode.length}</span>
              </div>
            </div>
            <input
              class="episode-player-progress"
              type="range"
              min="0"
              max="1000"
              value="0"
              step="1"
              aria-label="Seek episode audio"
            />
            <audio class="episode-audio" preload="metadata" src="${episode.audioUrl}"></audio>
          </div>
        `
        : ""
    }
    ${
      embedUrl
        ? `
          <section class="episode-video">
            <div class="episode-video-header">
              <span class="episode-video-kicker">Video</span>
              <a class="episode-video-link" href="${getEpisodeYouTubeUrl(episode)}" target="_blank" rel="noreferrer">Open on YouTube</a>
            </div>
            <div class="episode-video-frame">
              <iframe
                src="${embedUrl}"
                title="${getEpisodeDisplayLabel(episode)} on YouTube"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                referrerpolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          </section>
        `
        : ""
    }
    ${
      buildPlatformMarkup(episode)
        ? `<div class="episode-detail-actions">${buildPlatformMarkup(episode)}</div>`
        : ""
    }
    <div class="episode-detail-body">
      ${formatParagraphs(episode.fullSummary)}
    </div>
  `;

  setupEpisodeAudioPlayer();
}

function setupEpisodeAudioPlayer() {
  const audio = detailCard.querySelector(".episode-audio");

  if (!audio) {
    return;
  }

  const toggle = detailCard.querySelector(".episode-player-toggle");
  const progress = detailCard.querySelector(".episode-player-progress");
  const currentTimeLabel = detailCard.querySelector(".episode-player-current");
  const durationLabel = detailCard.querySelector(".episode-player-duration");

  const syncButton = () => {
    const isPlaying = !audio.paused && !audio.ended;
    toggle.textContent = isPlaying ? "Pause" : "Play";
    toggle.setAttribute("aria-label", isPlaying ? "Pause episode" : "Play episode");
  };

  const syncTimeline = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const progressValue = duration > 0 ? Math.round((currentTime / duration) * 1000) : 0;

    progress.value = String(progressValue);
    currentTimeLabel.textContent = formatPlayerTime(currentTime);
    durationLabel.textContent = duration > 0 ? formatPlayerTime(duration) : durationLabel.textContent;
  };

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error(error);
      }
    } else {
      audio.pause();
    }
  });

  progress.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    audio.currentTime = (Number(progress.value) / 1000) * audio.duration;
    syncTimeline();
  });

  audio.addEventListener("loadedmetadata", syncTimeline);
  audio.addEventListener("timeupdate", syncTimeline);
  audio.addEventListener("play", syncButton);
  audio.addEventListener("pause", syncButton);
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    syncTimeline();
    syncButton();
  });

  syncTimeline();
  syncButton();
}

function stopEpisodeAudio() {
  const audio = detailCard.querySelector(".episode-audio");

  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
}

function showView(view) {
  if (view !== "detail") {
    stopEpisodeAudio();
  }

  landingView.classList.toggle("is-hidden", view !== "landing");
  archiveView.classList.toggle("is-hidden", view !== "archive");
  detailView.classList.toggle("is-hidden", view !== "detail");
  document.body.dataset.view = view;
}

function renderRoute() {
  const match = window.location.hash.match(/^#\/episodes\/(.+)$/);

  if (window.location.hash === "#archive") {
    showView("archive");
    renderArchiveGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (window.location.hash === "#recent") {
    renderEpisodeDetail(episodes[0]);
    showView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (match) {
    const [, slug] = match;
    const episode = getVisibleEpisodes().find((item) => item.slug === slug) || (episodes[0]?.slug === slug ? episodes[0] : null);

    if (!episode) {
      window.location.hash = "#archive";
      return;
    }

    renderEpisodeDetail(episode);
    showView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  showView("landing");
}

window.addEventListener("hashchange", renderRoute);
archiveSearchInput.addEventListener("input", (event) => {
  archiveQuery = event.target.value;
  renderArchiveGrid();
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
      spotifyUrl: match.spotifyUrl || "",
      youtubeUrl: match.youtubeUrl || ""
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
    renderLanding();
    renderArchiveGrid();
    renderRoute();
  } catch (error) {
    archiveStatus.textContent = "Live feed unavailable right now. Showing placeholder episodes.";
    console.error(error);
  }
}

renderLanding();
renderArchiveGrid();
renderRoute();
loadEpisodesFromFeed();
