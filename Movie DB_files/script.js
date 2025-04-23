
  //Model
  // create storage
  const state = {
    movies: [],
    movieDetails: [],
    likedMovies: new Set(),
    currentPage: 1,
    totalPages: 1,
  };

  // Fetch backend data
  // Get Token
  const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZWEzNTM4NTk3NGFkY2RkOWFlOTRhNDAwOWQwN2VhNyIsIm5iZiI6MTc0NTM2ODIwNC4xNzI5OTk5LCJzdWIiOiI2ODA4MzQ4Y2FjMDJkNDQwN2JhYjI1ZjciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jFuUA7bOpK6YedyqEbE8AhQePkU_bsEUnTkn1awptVY'; 
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: TOKEN,
    },
  };

  const fetchMovieList = async (page = 1) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`, options);
      if (!res.ok) throw new Error("Network Response Error!");
      const data = await res.json();
      state.movies = data.results;
      state.currentPage = data.page;
      state.totalPages = data.total_pages;
    } catch (err) {
      console.error("Error fetching movie list:", err);
    }
  };

  const fetchMovieDetails = async (movieId) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options);
      if (!res.ok) throw new Error("Network Response Error!");
      return await res.json();
    } catch (err) {
      console.error("Error fetching movie details:", err);
    }
  };

  // Store liked movies
  const saveLikedMovies = () => {
    localStorage.setItem('likedMovies', JSON.stringify([...state.likedMovies]));
  };
  
  const loadLikedMovies = () => {
    const saved = localStorage.getItem('likedMovies');
    if (saved) state.likedMovies = new Set(JSON.parse(saved));
  };

  //View
  // Orgnize all needed elements
  const elements = {
    searchInput: document.getElementById('search-input'),
    likeMenu: document.getElementById('like-menu'),
    homeMenu: document.getElementById('home-menu'),
    movieContainer: document.querySelector('.movie-container'),
    prevBtn: document.getElementById('previous-page-btn'),
    nextBtn: document.getElementById('next-page-btn'),
    pageText: document.querySelector('.page-btn p'),
    modal: document.getElementById('movie-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalImage: document.getElementById('modal-image'),
    modalOverview: document.getElementById('modal-overview'),
    modalReleaseYear: document.getElementById('modal-release-year'),
    modalRuntime: document.getElementById('modal-runtime'),
    modalGenres: document.getElementById('modal-genres'),
    modalRating: document.getElementById('modal-rating'),
    modalCompanies: document.getElementById('modal-companies'),
    closeButton: document.querySelector('.close-button'),
  };

  // Create Movie card
  const createMovieCard = (movie) => {
    const path = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : './no-image-img.png';
  
    const liked = state.likedMovies.has(movie.id);
    const heartClass = liked ? 'ion-ios-heart liked' : 'ion-ios-heart-outline';
    const div = document.createElement("div"); 
    div.innerHTML = `
      <div class="movie-card" data-id="${movie.id}">
        <img src="${path}" alt="${movie.title}" />
        <h4 class="movie-name">${movie.title}</h4>
        <div class="movie-icons">
          <div class="rating-display">
            <i class="ion-ios-star star"></i>
            ${movie.vote_average.toFixed(2)}
          </div>
          <i class="${heartClass} like-icon" data-movie-id="${movie.id}"></i>
        </div>
      </div>
  `;
  return div;
      <div class="movie-card" data-id="${movie.id}">
        <img src="${path}" alt="${movie.title}" />
        <h4 class="movie-name">${movie.title}</h4>
        <div class="movie-icons">
          <div class="rating-display">
            <i class="ion-ios-star star"></i>
            ${movie.vote_average.toFixed(2)}
          </div>
          <i class="${heartClass} like-icon" data-movie-id="${movie.id}"></i>
        </div>
      </div>
    `;
  
    const wrapper = document.createElement("div");
    wrapper.innerHTML = cardHTML;
    return wrapper.firstElementChild;
  };
  

  // Render
  const renderMovies = (movies, currentPage, totalPages) => {
    elements.movieContainer.innerHTML = "";
    movies.forEach((movie) => {
      const movieCard = createMovieCard(movie);
      elements.movieContainer.append(movieCard);
    });

    elements.pageText.textContent = `Page ${currentPage} / ${totalPages}`;
    elements.prevBtn.disabled = currentPage === 1;
    elements.nextBtn.disabled = currentPage === totalPages;    
  };

  // Modal
  const showModal = (movie) => {
    const roundedRating = Math.round(movie.vote_average);
    const totalStars = 10;

    let starsHTML = "";
    for (let i = 1; i <= totalStars; i++) {
      starsHTML += `<i class="ion-ios-star${i <= roundedRating ? '' : '-outline'} star"></i>`;
    }

    elements.modalTitle.textContent = movie.title;
    elements.modalOverview.textContent = movie.overview;
    elements.modalRuntime.textContent = `${movie.runtime || "N/A"} min`;
    elements.modalGenres.textContent = `${movie.genres.map(g => g.name).join(", ")}`;
    elements.modalRating.innerHTML = `
      <div class="rating-display">
        ${starsHTML}
      </div>
    `;
    elements.modalImage.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    elements.modalCompanies.innerHTML = movie.production_companies
    .filter(c => c.logo_path)
    .map(c => `
      <img src="https://image.tmdb.org/t/p/w300${c.logo_path}" 
      alt="${c.name}" 
      title="${c.name}" 
      class="company-logo" />
      `)
      .join("");
      
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
    elements.modalReleaseYear.textContent = `${year}`;
    elements.modal.classList.remove("hidden");
  };
  
  // Hide Modal
  const hideModal = () => {
    elements.modal.classList.add("hidden");
  };

  //Controller
  // Call Functions in order
  const runApp = async () => {
    loadLikedMovies();
    await fetchMovieList();
    renderMovies(state.movies, state.currentPage, state.totalPages);
    eventListeners();
  };

  // Orgnize eventListeners 
  const eventListeners = () => {
    // search bar - search by titles/names
    elements.searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      const filteredMovies = state.movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
      );
      renderMovies(filteredMovies, state.currentPage, state.totalPages);
    });

    // Like-Menu
    elements.likeMenu.addEventListener('click', (e) => {
      e.preventDefault();
      const likedArr = state.movies.filter((m) => state.likedMovies.has(m.id));
      renderMovies(likedArr, 1, 1);
    });

     // Home-Menu
    elements.homeMenu.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetchMovieList();
      renderMovies(state.movies, state.currentPage, state.totalPages);
    });

    // Page-Btn
    elements.prevBtn.addEventListener("click", async () => {
      if (state.currentPage > 1) {
        await fetchMovieList(state.currentPage - 1);
        renderMovies(state.movies, state.currentPage, state.totalPages);
      } 
    });
    elements.nextBtn.addEventListener("click", async () => {
      if (state.currentPage < state.totalPages) {
        await fetchMovieList(state.currentPage + 1);
        renderMovies(state.movies, state.currentPage, state.totalPages);
      }
    });

    // Like-icon Click / Toggle like
    elements.movieContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('like-icon')) return;

      const isLikedId = +e.target.dataset.movieId;
      if (state.likedMovies.has(isLikedId)) {
        state.likedMovies.delete(isLikedId);
        e.target.classList.replace('ion-ios-heart', 'ion-ios-heart-outline');
        e.target.classList.remove('liked');
      } else {
        state.likedMovies.add(isLikedId);
        e.target.classList.replace('ion-ios-heart-outline', 'ion-ios-heart');
        e.target.classList.add('liked');
      }

      saveLikedMovies();
    });

    //Show modal
    elements.movieContainer.addEventListener("click", async (e) => {
      if (e.target.classList.contains("movie-name")) {
        const movieTitle = e.target.textContent;
        const movie = state.movies.find(m => m.title === movieTitle);
        if (movie) {
          const details = await fetchMovieDetails(movie.id);
          showModal(details);
        }
      }
    });

    //Close Modal
    elements.closeButton.addEventListener("click", hideModal);
    window.addEventListener("click", (e) => {
      if (e.target === elements.modal) hideModal();
    });
  };


  runApp();

