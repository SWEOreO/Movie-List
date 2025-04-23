
  //Model
  const state = {
    movies: [],
    movieDetails: [],
    likedStatus: false,
    currentPage: 1,
    totalPages: 1,
  };

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

  //View
  const elements = {
    searchInput: document.getElementById("search-input"),
    movieContainer: document.querySelector(".movie-container"),
    prevBtn: document.getElementById("previous-page-btn"),
    nextBtn: document.getElementById("next-page-btn"),
    pageText: document.querySelector(".page-btn p"),
    modal: document.getElementById("movie-modal"),
    modalTitle: document.getElementById("modal-title"),
    modalImage: document.getElementById("modal-image"),
    modalOverview: document.getElementById("modal-overview"),
    modalReleaseYear: document.getElementById("modal-release-year"),
    modalRuntime: document.getElementById("modal-runtime"),
    modalGenres: document.getElementById("modal-genres"),
    modalRating: document.getElementById("modal-rating"),
    modalCompanies: document.getElementById("modal-companies"),
    closeButton: document.querySelector(".close-button"),
  };

  const createMovieCard = (movie) => {
    const path = movie.poster_path === null ? `./no-image-img.png` : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    const div = document.createElement("div"); 
    div.className = "movie-card";
    div.innerHTML = `
      <img src="${path}" alt="${movie.title}" />
      <h4 class="movie-name">${movie.title}</h4>
      <p>Rating: ${movie.vote_average}</p>
      <div class="movie-icons">
        <i class="ion-ios-star-outline star-icon" data-movie-id="${movie.id}"></i>
        <i class="ion-ios-heart-outline like-icon" data-movie-id="${movie.id}"></i>
      </div>
    `;
    return div;
  };

  const renderMovies = (movies, currentPage, totalPages) => {
    elements.movieContainer.innerHTML = "";
    movies.forEach((movie) => {
      const movieCard = createMovieCard(movie);
      elements.movieContainer.append(movieCard);
    });

    elements.pageText.textContent = `Page ${currentPage} / ${totalPages}`;
    elements.prevBtn.disabled = currentPage === 1;
    elements.nextBtn.disabled = currentPage === totalPages;

    document.querySelectorAll(".like-icon").forEach(icon => {
      icon.addEventListener("click", () => {
        icon.classList.toggle("ion-ios-heart-outline");
        icon.classList.toggle("ion-ios-heart");
        icon.classList.toggle("liked");
      });
    });

    document.querySelectorAll(".star-icon").forEach(icon => {
      icon.addEventListener("click", () => {
        icon.classList.toggle("ion-ios-star-outline");
        icon.classList.toggle("ion-ios-star");
        icon.classList.toggle("starred");
      });
    });
  };

  const showModal = (movie) => {
    elements.modalTitle.textContent = movie.title;
    elements.modalOverview.textContent = movie.overview;
    elements.modalRuntime.textContent = `${movie.runtime || "N/A"} min`;
    elements.modalGenres.textContent = `${movie.genres.map(g => g.name).join(", ")}`;
    elements.modalRating.textContent = `${movie.vote_average}`;
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
  

  const hideModal = () => {
    elements.modal.classList.add("hidden");
  };

  //Controller
  const runApp = async () => {
    await fetchMovieList();
    renderMovies(state.movies, state.currentPage, state.totalPages);
    eventListeners();
  };

  const eventListeners = () => {
    elements.searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      const filteredMovies = state.movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
      );
      renderMovies(filteredMovies, state.currentPage, state.totalPages);
    });
    
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

    elements.closeButton.addEventListener("click", hideModal);
    window.addEventListener("click", (e) => {
      if (e.target === elements.modal) hideModal();
    });
  };


  runApp();

