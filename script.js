
  //Model
  // create storage
  const state = {
    movies: [],
    movieDetails: [],
    likedMovies: new Set(),
    isLikeView: false,
    likedMoviesArray: [],
    currentPage: 1,
    currentCategory: 'popular',
    totalPages: 1,
    itemsPerPage: 20,
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

  const fetchMovieList = async (page = 1, category = state.currentCategory) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`, options);
      if (!res.ok) throw new Error("Network Response Error!");
      const data = await res.json();
      state.movies = data.results.map((movie) => ({
        ...movie,
        isLiked: state.likedMovies.has(movie.id),
      }));
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

  const updateLikedMoviesArray = () => {
    const likedMovieIds = Array.from(state.likedMovies);
    state.likedMoviesArray = state.movies.filter(movie => likedMovieIds.includes(movie.id));
    state.totalPages = Math.ceil(state.likedMoviesArray.length / state.itemsPerPage);
  };


  //View
  // Orgnize all needed elements
  const elements = {
    searchInput: document.getElementById('search-input'),
    likeMenu: document.getElementById('like-menu'),
    homeMenu: document.getElementById('home-menu'),
    movieContainer: document.querySelector('.movie-container'),
    noLikedMessage: document.getElementById('no-liked-message'),
    clearLikedBtn: document.getElementById('clear-liked-btn'),
    prevBtn: document.getElementById('previous-page-btn'),
    nextBtn: document.getElementById('next-page-btn'),
    pageText: document.querySelector('.page-btn p'),
    pageInput: document.getElementById('page-input'),
    jumpBtn: document.getElementById('jump-btn'),
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

  const renderLikedMoviesPage = () => {
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    const pagedLiked = state.likedMoviesArray.slice(startIdx, endIdx);
  
    // Show/hide no liked message
    if (state.likedMoviesArray.length === 0) {
      elements.noLikedMessage.classList.remove("hidden");
    } else {
      elements.noLikedMessage.classList.add("hidden");
    }
  
    renderMovies(pagedLiked, state.currentPage, state.totalPages);
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
    elements.likeMenu.addEventListener('click', async (e) => {
      e.preventDefault();
      state.isLikeView = true;
    
      const likedIds = Array.from(state.likedMovies);
    
      const likedDetails = await Promise.all(
        likedIds.map(id => fetchMovieDetails(id))
      );
    
      const likedMovies = likedDetails.map(movie => ({
        ...movie,
        isLiked: true,
      }));
    
      state.likedMoviesArray = likedMovies;
      state.currentPage = 1;
      state.totalPages = Math.ceil(likedMovies.length / state.itemsPerPage);
    
      renderLikedMoviesPage();
    
      if (likedMovies.length > 0) {
        elements.clearLikedBtn.classList.remove("hidden");
      } else {
        elements.clearLikedBtn.classList.add("hidden");
      }
    });
  
    // Home-Menu
    elements.homeMenu.addEventListener('click', async (e) => {
      e.preventDefault();
      state.isLikeView = false;
      await fetchMovieList();
      renderMovies(state.movies, state.currentPage, state.totalPages);
    });

    // Page-Btn
    elements.prevBtn.addEventListener("click", async () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        if (state.isLikeView) {
          renderLikedMoviesPage();
        } else {
          await fetchMovieList(state.currentPage);
          renderMovies(state.movies, state.currentPage, state.totalPages);
        }
      }
    });
    elements.nextBtn.addEventListener("click", async () => {
      if (state.currentPage < state.totalPages) {
        state.currentPage++;
        if (state.isLikeView) {
          renderLikedMoviesPage();
        } else {
          await fetchMovieList(state.currentPage);
          renderMovies(state.movies, state.currentPage, state.totalPages);
        }
      }
    });
    elements.jumpBtn.addEventListener("click", async () => {
      const page = parseInt(elements.pageInput.value);
      if (!isNaN(page) && page >= 1 && page <= state.totalPages) {
        state.currentPage = page;
        if (state.isLikeView) {
          renderLikedMoviesPage();
        } else {
          await fetchMovieList(page);
          renderMovies(state.movies, state.currentPage, state.totalPages);
        }
        elements.pageInput.value = "";
      }
    });
    
    // Like-icon Click / Toggle like
    elements.movieContainer.addEventListener('click', async (e) => {
      if (!e.target.classList.contains('like-icon')) return;
    
      const movieId = +e.target.dataset.movieId;
      const movie = state.movies.find(m => m.id === movieId);
    
      if (!movie) return;
    
      movie.isLiked = !movie.isLiked;
    
      if (movie.isLiked) {
        state.likedMovies.add(movieId);
        e.target.classList.replace('ion-ios-heart-outline', 'ion-ios-heart');
        e.target.classList.add('liked');
      } else {
        state.likedMovies.delete(movieId);
        e.target.classList.replace('ion-ios-heart', 'ion-ios-heart-outline');
        e.target.classList.remove('liked');
    
        // If on Like-menu view, remove movie from display
        if (state.isLikeView) {
          const likedArr = state.movies.filter((m) => m.isLiked);
          renderMovies(likedArr, 1, 1);
        }
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

    //Back-to-Top Button
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Clear All Liked
    elements.clearLikedBtn.addEventListener("click", () => {
      state.likedMovies.clear();
      saveLikedMovies();
    
      state.movies = [];
      renderMovies([], 1, 1);
      elements.clearLikedBtn.classList.add("hidden");
    });
    
  
  runApp();

