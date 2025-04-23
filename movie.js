// MVC
// Model
const state = {
  movies: [],
  likedStatus: false,
  currentPage: 1,
  totalPages: 1,
};

// Controller
const fetchMovieDetails = (page = 1) => {
  console.log(`Fetching movies for page ${page}`)

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZWEzNTM4NTk3NGFkY2RkOWFlOTRhNDAwOWQwN2VhNyIsIm5iZiI6MTc0NTM2ODIwNC4xNzI5OTk5LCJzdWIiOiI2ODA4MzQ4Y2FjMDJkNDQwN2JhYjI1ZjciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jFuUA7bOpK6YedyqEbE8AhQePkU_bsEUnTkn1awptVY'
    }
  };

  return fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`, options)
    .then((res) => {
      if (!res.ok) throw new Error("NetWork Response Error!!!")
      return res.json();
    })
    .then((data) => {
      state.movies = data.results;
      state.currentPage = data.page;
      state.totalPages = data.total_pages;
    })
    .catch(err => console.error("Getting an Error:",err));
};


// View
const movieContainer = document.querySelector(".movie-container");
const movieCard = document.querySelector(".movie-name");
const prevBtn = document.getElementById("previous-page-btn");
const nextBtn = document.getElementById("next-page-btn");
const pageText = document.querySelector(".page-btn p");

const createNode = (movie) => {
  const div = document.createElement("div");
  div.className = "movie-card";
  div.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${movie.backdrop_path}" alt="${movie.title}" />
    <h4 class="movie-name">${movie.title}</h4>
    <p>Rating: ${movie.vote_average}</p>
    <div class="movie-icons">
      <i class="ion-ios-star-outline star-icon" data-movie-id="${movie.id}"></i>
      <i class="ion-ios-heart-outline like-icon" data-movie-id="${movie.id}"></i>
    </div>
  `;
  return div; 
};

const renderView = () => {
  movieContainer.innerHTML = "";
  state.movies.forEach((movie) => {
    const node = createNode(movie);
    movieContainer.append(node);
  });

  pageText.textContent = `Page ${state.currentPage} / ${state.totalPages}`;

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
  

  console.log("Displayed Data");
  console.log("Rendered Movies:", state.movies);
};

prevBtn.addEventListener("click", () => {
  if (state.currentPage > 1) {
    fetchMovieDetails(state.currentPage - 1).then(() => {
      renderView();
    });
  }
});

nextBtn.addEventListener("click", () => {
  if (state.currentPage < state.totalPages) {
    fetchMovieDetails(state.currentPage + 1).then(() => {
      renderView();
    });
  }
});


fetchMovieDetails().then(() => {
  renderView();
});
