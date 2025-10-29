// ============================
// API KEYS ("da640c5348b2160130caffad48ed48"
"9f67f9aa"df826ebd7dbe45d39478d93873bec3"39743679d06c35722219d6fae5ef4b14c4fcfee3526bca21dec00dfeo644ac65")
// ============================
const TMDB_API_KEY="da640c5348b2160130caffad48ed48";
const JAMENDO_CLIENT_ID="9f67f9aa";
const NEWS_API_KEY="df826ebd7dbe45d39478d9e873bec3";
const FOOTBALL_API_KEY="39743679d06c35722219d6fae5ef4b14c4fcfef3526bca21dec00dfe0644ac65";

// ============================
// DOM
// ============================
const searchBtn=document.getElementById('searchBtn');
const searchInput=document.getElementById('searchInput');
const resultsDiv=document.getElementById('results');
const prevPageBtn=document.getElementById("prevPage");
const nextPageBtn=document.getElementById("nextPage");
const pageNumSpan=document.getElementById("pageNum");
const tabButtons=document.querySelectorAll(".tab-button");
const menuItems=document.querySelectorAll(".sub-menu .menu-item");
const modal=document.getElementById("movieModal");
const modalBody=document.getElementById("modal-body");
const modalClose=document.querySelector(".modal .close");

let currentTab="movies";
let currentPage=1;
let lastQuery="";
const moviesPerPage=8;
const musicPerPage=8;

// ============================
// TMDb Functions
// ============================
async function searchTMDB(query){
    const res=await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    const data=await res.json();
    return data.results||[];
}

async function searchTMDB(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
// Helper function to fetch from TMDb
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
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
}     }

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

async function getProviders(tmdbId,country="US"){
    const res=await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`);
    const data=await res.json();
    return data.results[country]||null;
}

// ============================
// Jamendo Music
// ============================
async function searchJamendo(query){
    const res=await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=10&namesearch=${encodeURIComponent(query)}&audioformat=mp31`);
    const data=await res.json();
    return data.results||[];
}

// ============================
// News API
// ============================
async function fetchNews(){
    const res=await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`);
    const data=await res.json();
    return data.articles||[];
}

// ============================
// Display Results
// ============================
async function displayResults(query=""){
    resultsDiv.innerHTML="<p style='grid-column:1/-1;text-align:center;'>Loading...</p>";
    resultsDiv.innerHTML="";

    if(currentTab==="movies"){
        const movies=await searchTMDB(query);
        const dataToShow=movies.slice((currentPage-1)*moviesPerPage,currentPage*moviesPerPage);
        for(const movie of dataToShow){
            const providers=await getProviders(movie.id);
            let watchLink=providers&&providers.flatrate?providers.flatrate[0]?.link||"":"";
            const trailerRes=await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`);
            const trailerData=await trailerRes.json();
            const trailer=trailerData.results.find(v=>v.type==="Trailer"&&v.site==="YouTube");
            const trailerLink=trailer?`https://www.youtube.com/embed/${trailer.key}`:"";

            const card=document.createElement('div');
            card.className="card";
            card.setAttribute("data-icon","🎬");
            card.innerHTML=`
                <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                <div class="card-content">
                    <h3>${movie.title}</h3>
                    <p>Movie • ${movie.release_date?movie.release_date.slice(0,4):"N/A"}</p>
                    <div class="card-buttons">
                        ${watchLink?`<a href="${watchLink}" target="_blank">Watch</a>`:""}
                        ${trailerLink?`<button class="previewBtn">Preview</button>`:""}
                    </div>
                </div>
            `;
            resultsDiv.appendChild(card);
            if(trailerLink){
                const previewBtn=card.querySelector(".previewBtn");
                previewBtn.addEventListener("click",()=>{
                    modalBody.innerHTML=`
                        <h2>${movie.title}</h2>
                        <iframe src="${trailerLink}" frameborder="0" allowfullscreen></iframe>
                        ${watchLink?`<p><a href="${watchLink}" target="_blank">Watch Full Movie</a></p>`:""}
                    `;
                    modal.style.display="block";
                });
            }
        }
    }

    else if(currentTab==="music"){
        const tracks=await searchJamendo(query);
        const dataToShow=tracks.slice((currentPage-1)*musicPerPage,currentPage*musicPerPage);
        for(const track of dataToShow){
            const card=document.createElement('div');
            card.className="card";
            card.setAttribute("data-icon","🎵");
            card.innerHTML=`
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
    }

    pageNumSpan.innerText=currentPage;
    prevPageBtn.disabled=currentPage===1;
    nextPageBtn.disabled=false;
}

// ============================
// Event Listeners
// ============================
searchBtn.addEventListener("click",()=>{ lastQuery=searchInput.value.trim(); currentPage=1; displayResults(lastQuery); });
tabButtons.forEach(btn=>{ btn.addEventListener("click",()=>{ tabButtons.forEach(b=>b.classList.remove("active")); btn.classList.add("active"); currentTab=btn.dataset.tab; currentPage=1; displayResults(lastQuery); }); });
menuItems.forEach(item=>{ item.addEventListener("click",()=>{ menuItems.forEach(i=>i.classList.remove("active")); item.classList.add("active"); currentTab=item.dataset.category; currentPage=1; displayResults(lastQuery); }); });
prevPageBtn.addEventListener("click",()=>{ if(currentPage>1){currentPage--; displayResults(lastQuery);} });
nextPageBtn.addEventListener("click",()=>{ currentPage++; displayResults(lastQuery); });
modalClose.addEventListener("click",()=>{ modal.style.display="none"; });
window.addEventListener("click",(e)=>{ if(e.target==modal) modal.style.display="none"; });
displayResults();
