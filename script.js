// ============================
// API KEYS
// ============================
const TMDB_API_KEY = "da640c5348b213160130caffad48ed48";           // Replace with your TMDb API key
const JAMENDO_CLIENT_ID = "9f67f9aa"; // Replace with your Jamendo Client ID

// ============================
// DOM ELEMENTS
// ============================
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

// ============================
// TMDb FUNCTIONS
// ============================
async function searchTMDB(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

async function getProviders(tmdbId, country = "US") {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results[country] || null;
}

// ============================
// INTERNET ARCHIVE FUNCTIONS
// ============================
async function searchArchive(query) {
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier,title,description&output=json`;
    const res = await fetch(url);
    const data = await res.json();
    return data.response.docs;
}

async function getArchiveFiles(identifier) {
    const url = `https://archive.org/metadata/${identifier}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.files || [];
}

// ============================
// JAMENDO FUNCTIONS
// ============================
async function searchJamendo(query) {
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=5&namesearch=${encodeURIComponent(query)}&audioformat=mp31`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

// ============================
// DISPLAY RESULTS FUNCTION
// ============================
async function displayResults(query) {
    resultsDiv.innerHTML = "<p style='grid-column:1/-1;text-align:center;'>Loading...</p>";

    // 1️⃣ TMDb movies
    const movies = await searchTMDB(query);

    // 2️⃣ Internet Archive public-domain content
    const archiveResults = await searchArchive(query);

    // 3️⃣ Jamendo music
    const musicResults = await searchJamendo(query);

    resultsDiv.innerHTML = ""; // Clear loading

    // --- Display TMDb movies ---
    for (const movie of movies.slice(0, 10)) {
        const providers = await getProviders(movie.id);
        let watchLink = "";
        if (providers && providers.flatrate) {
            watchLink = providers.flatrate[0]?.link || "";
        }

        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
            <div class="card-content">
                <h3>${movie.title}</h3>
                <p>Movie • ${movie.release_date ? movie.release_date.slice(0,4) : "N/A"}</p>
                <div class="card-buttons">
                    ${watchLink ? `<a href="${watchLink}" target="_blank">Watch</a>` : ""}
                </div>
            </div>
        `;
        resultsDiv.appendChild(card);
    }

    // --- Display Internet Archive public-domain movies/music ---
    for (const item of archiveResults.slice(0,5)) {
        const files = await getArchiveFiles(item.identifier);
        const mediaFile = files.find(f => f.format?.toLowerCase().includes("mp4") || f.format?.toLowerCase().includes("mp3"));
        if (!mediaFile) continue;

        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `
            <img src="https://archive.org/services/img/${item.identifier}" alt="${item.title}">
            <div class="card-content">
                <h3>${item.title}</h3>
                <p>Public-domain ${mediaFile.format.includes("mp3") ? "Music" : "Movie"}</p>
                <div class="card-buttons">
                    <a href="https://archive.org/download/${item.identifier}/${mediaFile.name}" target="_blank">Download</a>
                </div>
            </div>
        `;
        resultsDiv.appendChild(card);
    }

    // --- Display Jamendo music ---
    for (const track of musicResults) {
        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `
            <img src="${track.album_image}" alt="${track.name}">
            <div class="card-content">
                <h3>${track.name}</h3>
                <p>Music • ${track.artist_name}</p>
                <div class="card-buttons">
                    <a href="${track.audio}" target="_blank">Download</a>
                    <a href="${track.audio}" target="_blank">Play</a>
                </div>
            </div>
        `;
        resultsDiv.appendChild(card);
    }

    if (resultsDiv.innerHTML === "") {
        resultsDiv.innerHTML = "<p style='grid-column:1/-1;text-align:center;'>No results found.</p>";
    }
}

// ============================
// EVENT LISTENER
// ============================
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) return;
    displayResults(query);
});

