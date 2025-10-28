const TMDB_API_KEY = "YOUR_TMDB_KEY"; // <-- Replace with your TMDb API key
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

// Helper function to fetch from TMDb
async function searchTMDB(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

// Fetch watch providers
async function getProviders(tmdbId, country = "US") {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results[country] || null;
}

// Fetch public-domain movies from Internet Archive
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

// Display results
async function displayResults(query) {
    resultsDiv.innerHTML = "<p style='grid-column:1/-1;text-align:center;'>Loading...</p>";

    // 1️⃣ TMDb results
    const movies = await searchTMDB(query);
    // 2️⃣ Archive results
    const archiveResults = await searchArchive(query);

    resultsDiv.innerHTML = ""; // Clear loading

    // Combine results: TMDb first
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

    // Archive results (public-domain downloads)
    for (const item of archiveResults.slice(0, 5)) {
        const files = await getArchiveFiles(item.identifier);
        const mp4File = files.find(f => f.format?.toLowerCase().includes("mp4"));
        if (!mp4File) continue;

        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `
            <img src="https://archive.org/services/img/${item.identifier}" alt="${item.title}">
            <div class="card-content">
                <h3>${item.title}</h3>
                <p>Public-domain download</p>
                <div class="card-buttons">
                    <a href="https://archive.org/download/${item.identifier}/${mp4File.name}" target="_blank">Download</a>
                </div>
            </div>
        `;
        resultsDiv.appendChild(card);
    }

    if (resultsDiv.innerHTML === "") {
        resultsDiv.innerHTML = "<p style='grid-column:1/-1;text-align:center;'>No results found.</p>";
    }
}

// Event listener
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) return;
    displayResults(query);
});
