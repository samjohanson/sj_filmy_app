/*User searchbar (input), random movies & sorting elements selectors*/
const searchMovieInput = document.getElementById("search_movie_input");
const randomMovies = document.getElementById("movie_random");
const sortSelect = document.getElementById("sort_select");
const movieSortByRating = document.getElementById("movie_sort_by_rating");
const sortBtn = document.getElementById("sort_btn");
/*Favorite list and it's related elements selectors*/
const favoritesList = document.getElementById("favorites_list");
const favoritesContainer = document.querySelector(".favorites_container");
const favoritesLink = document.getElementById("favorites_link");
const favoritesHide = document.getElementById("favorites_hide");
const allHearts = document.getElementsByClassName("single_movie_favorite");
/* Movie list and 'No movies found' message selectors */
const movieList = document.getElementById("movie_list");
const noMovieFound = document.querySelector(".no_movie_found");
const noMovieFoundMessage = document.getElementById("no_movie_message");
/* Header selector */
const header = document.querySelector(".header");

/* Array of favorited movies */
let favoritesArray = [];

/* A function to sort the rendered movies from the best rated to the worst rated OR vice-versa. */
const sortMovies = () => {
  // Const with all currently displayed movies
  const arrayOfUnorderedMovies = [...movieList.querySelectorAll(".movie_card")];

  let arrayOfSortedMovies;
  // IF select element is set to 'From highest to lowest' rating
  if (sortSelect.value === "from_highest") {
    sortBtn.innerHTML =
      '<p id="sort_by_rating"><i class="fa-solid fa-arrow-down-wide-short" style="margin-right: 0.5rem"></i>Sort by rating</p>';

    arrayOfSortedMovies = arrayOfUnorderedMovies
      .sort((a, b) => {
        return (
          +a.querySelector(".single_movie_rating").textContent[0] -
          +b.querySelector(".single_movie_rating").textContent[0]
        );
      })
      .reverse();
    // ELSE IF select element is set to 'From lowest to highest' rating
  } else if (sortSelect.value === "from_lowest") {
    sortBtn.innerHTML =
      '<p id="sort_by_rating"><i class="fa-solid fa-arrow-down-short-wide" style="margin-right: 0.5rem"></i>Sort by rating</p>';

    arrayOfSortedMovies = arrayOfUnorderedMovies.sort((a, b) => {
      return (
        +a.querySelector(".single_movie_rating").textContent[0] -
        +b.querySelector(".single_movie_rating").textContent[0]
      );
    });
  }

  // Delete all previously rendered movies in the MovieList Ul element
  while (movieList.querySelector("li")) {
    movieList.querySelector("li").remove();
  }
  //....and render the same movies which are now sorted from Lowest-to-highest / Highest-to-lowest rating
  for (const movie of arrayOfSortedMovies) {
    movieList.appendChild(movie);
  }
};

/* A function that fetches movies which have a name containing the provided search term, and then returns the results. */
const getMovies = async (searchTerm) => {
  // Necessary API key
  const apiKey = "dca7567bfee82db2684257b089f5f188";

  // Fetch and return data using the relevant search term and API key
  const fetchedData = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchTerm}`
  )
    .then((data) => {
      return data.json();
    })
    // Return a notification if no movies were returned
    .catch((error) => {
      noMovieFoundMessage.textContent =
        "We were unable to load any movies. Please check your internet connection.";
      noMovieFound.classList.add("d_flex");
    });

  const results = await fetchedData["results"];

  return results;
};

/* 
A function that first checks whether the movie which is clicked to be added to Favorites is not already in them,
and if not then proceeds to add the movie the the Favorites.
Then the function destroys the previous copy of "favorite_movies_array" array from local storage, and creates a brand new
"favorite_movies_array" array which contains the just-now added new favorite movie, and saves the array in the local storage.
*/
const addToFavorites = function () {
  // Const with the clicked Li parent element of whose "Add to favorites"
  // heart button the user just clicked
  const clickedMovie = this.parentElement.parentElement;
  // Create a new copy, not just a reference, of the just-now favorited movie Li item
  const clickedMovieHTML = [...clickedMovie.innerHTML].join("");

  // Check if the just-now favorited movie is not already present in the Favorites,
  // by searching for it's data_id attribute in the favoritesArray array.
  const checkIfAlreadyFavorite = favoritesArray.every((favorite) => {
    return (
      favorite.getAttribute("data_id") !== clickedMovie.getAttribute("data_id")
    );
  });

  // IF the movie already is in favorites, display notification
  if (!checkIfAlreadyFavorite) {
    clickedMovie.innerHTML =
      "<p class='add_to_favorites_message' style='width: 100%; height: 35rem; text-align: center; position: absolute; top: 50%'>Already saved in favorites.</p>";
    setTimeout(() => {
      clickedMovie.innerHTML = clickedMovieHTML;
      clickedMovie
        .querySelector(".single_movie_fave_and_date")
        .querySelector(".single_movie_favorite")
        .addEventListener("click", addToFavorites);
      for (const heart of allHearts) {
        heart.classList.remove("no_pointer_events");
      }
    }, 1000);
    return;
  }
  //Push the movie into the array of favorite movies and use it to re-render
  // the list of favorite movies, then display a relevant notification.
  favoritesArray.push(clickedMovie);

  renderFavorites(favoritesArray);

  // Display notification that the movie has been successfully added to Favorites.
  clickedMovie.innerHTML =
    "<p class='add_to_favorites_message'><i class='fa-solid fa-heart' style='pointer-events: none; color: rgb(229, 11, 20); height: 100%; width: 100%'></i><br />Added to favorites</p>";

  for (const heart of allHearts) {
    heart.classList.add("no_pointer_events");
  }

  setTimeout(() => {
    clickedMovie.innerHTML = clickedMovieHTML;
    clickedMovie
      .querySelector(".single_movie_fave_and_date")
      .querySelector(".single_movie_favorite")
      .addEventListener("click", addToFavorites);
    for (const heart of allHearts) {
      heart.classList.remove("no_pointer_events");
    }
  }, 1000);

  // Delete old array of favorite movies from local storage,
  // and create a brand-new one into which we push the just-now
  // favorited movie object, and then save it into the local storage.

  localStorage.removeItem("favorite_movies_array");

  const favoritedMovies = document.getElementsByClassName(
    "favorite_movie_card"
  );

  const mappedFavorites = [];

  for (const favorite of favoritedMovies) {
    mappedFavorites.push({
      favorite_image: favorite.querySelector(".favorite_image").src,
      favorite_name: favorite.querySelector(".single_movie_name").textContent,
      favorite_data_id: favorite.getAttribute("data_id"),
    });
  }

  const stringifiedFavorites = JSON.stringify(mappedFavorites);

  localStorage.setItem("favorite_movies_array", stringifiedFavorites);
};

/* 
A function that takes in the fetched and returned movies from the getMovies() function,
and then uses a for-of loop to loop through the array of movies and to create a new movie
card in the form of a Li element, to be rendered in the Ul element 'movieList'.
*/
const renderMovies = (moviesToRender) => {
  // Delete all previously rendered movies in the movieList Ul element.
  while (movieList.querySelector("li")) {
    movieList.querySelector("li").remove();
  }

  // Create a new Li element with all child elemenets and their data for each
  // movie to be rendered, and then append the Li element to the movieList Ul element.
  for (const movie of moviesToRender) {
    const newMovie = document.createElement("li");
    const newPicture = document.createElement("img");
    const newName = document.createElement("h2");
    const newDescription = document.createElement("p");
    const newRating = document.createElement("p");
    const newFaveAndDateContainer = document.createElement("div");
    const newFavorite = document.createElement("p");
    const newDate = document.createElement("p");

    newMovie.classList.add("movie_card");
    newMovie.setAttribute("data_id", +movie["id"]);

    newPicture.classList.add("single_movie_image");
    if (movie["poster_path"] === null) {
      newPicture.src = "./img/no_image.png";
    } else {
      newPicture.src = `http://image.tmdb.org/t/p/w500${movie["poster_path"]}`;
    }

    newName.classList.add("single_movie_name");
    if (movie["title"].length > 15) {
      newName.textContent = `${[...movie["title"]].slice(0, 14).join("")}...`;
    } else {
      newName.textContent = movie["title"];
    }

    const trimmedDescription = [...movie["overview"]].slice(0, 60).join("");
    newDescription.classList.add("single_movie_description");
    newDescription.textContent = `${trimmedDescription}...`;

    newRating.classList.add("single_movie_rating");
    newRating.innerHTML = `<span class="single_movie_rating_value">${Math.floor(
      +movie["vote_average"]
    )}</span> / 10`;

    newFaveAndDateContainer.classList.add("single_movie_fave_and_date");
    newFaveAndDateContainer.appendChild(newFavorite);
    newFaveAndDateContainer.appendChild(newDate);

    newFavorite.classList.add("single_movie_favorite");
    newFavorite.innerHTML = `<i class="fa-solid fa-heart" style="pointer-events: none"></i>`;
    newFavorite.addEventListener("click", addToFavorites);

    newDate.classList.add("single_movie_date");
    if (movie["release_date"] === "") {
      newDate.textContent = "---";
    } else {
      newDate.textContent = movie["release_date"];
    }

    newMovie.appendChild(newPicture);
    newMovie.appendChild(newName);
    newMovie.appendChild(newDescription);
    newMovie.appendChild(newRating);
    newMovie.appendChild(newFaveAndDateContainer);

    movieList.appendChild(newMovie);
  }
};

/* 
A function that generates a random letter from the alphabet,
and then passes it as an argument into the getMovies() function, which returns
an array of movies relevant to the search term (the provided random letter), which
is then passed as an argument into the renderMovies() function, and this function
then renders the movies as child Li elements in the Ul 'movieList'.
*/
const randomMovieHandler = async () => {
  searchMovieInput.value = "";

  noMovieFound.classList.remove("d_flex");

  const randomNumber = Math.floor(Math.random() * 26);

  const alphabet = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];

  const selectedLetter = alphabet[randomNumber];
  const firstRenderMovies = await getMovies(selectedLetter);
  renderMovies(firstRenderMovies);
};

/* 
A function that takes the user's input from the search bar,
checks whether it's empty (and IF SO uses randomMoviesHandler() function
to generate a list of random movies) and IF NOT then passes the search term
into the getMovies() function which returns an array of relevant movies,
and then this array is passed as an argument into the renderMovies() function.
In case a search term was used but no relevant results were fetched by the
getMovies() function (checked by the 2. IF statement), a 'No movies found'
message is rendered.
*/
const searchMovieHandler = async (event) => {
  event.preventDefault();

  let inputValue;

  // Check if the search bar (input) is empty, and if so then
  // just render random movies.
  if (searchMovieInput.value == "") {
    randomMovieHandler();
    return;
  } else {
    inputValue = searchMovieInput.value;
  }

  // If the user's input is valid (not empty), use the searched-forterm as an
  // argument for the getMovies() function which then returns an array of relevant
  // results, which are then rendered as movies by the renderMovies() function.
  const fetchedMovies = await getMovies(inputValue);

  if (fetchedMovies.length === 0) {
    // Return a notification if no movies were returned
    noMovieFound.classList.add("d_flex");
    noMovieFoundMessage.textContent =
      "No relevant movie was found for your search term. Please use a different search or select 'Get random movies!' option.";
  } else {
    noMovieFound.classList.remove("d_flex");
  }

  renderMovies(fetchedMovies);
};

/* 
A function which removes the clicked movie from the Favorites, by matching the data_id
attribute of the clicked movie with it's location in the favoritesArray array, and then using
the array.splice() method to remove it from the array. The function then re-renders the 
Favorites movies, using the remaining favoritesArray.
Afterwards, the function destroys the previous copy of "favorite_movies_array" array from local storage, and creates a brand new
"favorite_movies_array" array which no longer contains the just-now removed/trashed movie from the previous version
of the "favorite_movies_array" array.
*/
const trashFavorite = (event) => {
  // Parent Li element of the movie which is to be deleted from the Favorites
  const clickedFavorite = event.target.parentElement;
  const clickedId = clickedFavorite.getAttribute("data_id");

  const clickedFavoriteInArray = favoritesArray.findIndex((movie) => {
    return movie.getAttribute("data_id") == clickedId;
  });

  // Remove the Movie from the favoritesArray array, and re-render the favorited movie in the favoritesList.
  favoritesArray.splice(clickedFavoriteInArray, 1);

  renderFavorites(favoritesArray);

  // If there are no more favorite movies in the Favorites, close/hide the Favorites container.
  if (favoritesArray.length === 0) {
    toggleFavorites();
  }

  // Delete old array of favorite movies from local storage,
  // and create a brand-new one which no-longer contains the
  // just-now deleted movie, and then save it into the local storage.
  localStorage.removeItem("favorite_movies_array");

  const favoritedMovies = document.getElementsByClassName(
    "favorite_movie_card"
  );

  const mappedFavorites = [];

  for (const favorite of favoritedMovies) {
    mappedFavorites.push({
      favorite_image: favorite.querySelector(".favorite_image").src,
      favorite_name: favorite.querySelector(".single_movie_name").textContent,
      favorite_data_id: favorite.getAttribute("data_id"),
    });
  }

  const stringifiedFavorites = JSON.stringify(mappedFavorites);

  localStorage.setItem("favorite_movies_array", stringifiedFavorites);
};

/* 
A function which takes in an array of movies (movies in the favoritesArray) as an argument,
and then uses a for-of loop to loop through the array, creating a new Li element for each movie
and after appending all the relevant elements with data to it, appending the Li element itself to
the favoritesList Ul element.
*/
const renderFavorites = (favoritesToRender) => {
  while (favoritesList.querySelector("li")) {
    favoritesList.querySelector("li").remove();
  }
  for (const movie of favoritesToRender) {
    const newMovie = document.createElement("li");
    const newPicture = document.createElement("img");
    const newName = document.createElement("h2");
    const newDelete = document.createElement("button");

    newMovie.classList.add("favorite_movie_card");
    newMovie.setAttribute("data_id", +movie.getAttribute("data_id"));
    newMovie.addEventListener("click", trashFavorite);

    newPicture.src = movie.querySelector(".single_movie_image").src;
    newPicture.classList.add("favorite_image");

    const movieName = movie.querySelector(".single_movie_name").textContent;
    newName.classList.add("single_movie_name");
    newName.textContent = `${[...movieName].slice(0, 10).join("")}...`;

    newDelete.innerHTML = `<i class="fa-solid fa-heart-crack" style="pointer-events: none"></i>`;
    newDelete.classList.add("favorite_delete");

    newMovie.appendChild(newPicture);
    newMovie.appendChild(newName);
    newMovie.appendChild(newDelete);
    favoritesList.appendChild(newMovie);
  }
};

/* 
A function which after the user clicked to see the Favorites, checks whether the user has any movies
saved in the Favorites, and if not displays an appropriate message notifying the user about no movies
present in the Favorites.
If there are movies saved in the Favorites, they are already rendered by the renderFavorites() function
and this function only displays the container element that houses the Ul element favoritesList, which
contains the favorited movies as Li elements. 
*/
const toggleFavorites = () => {
  favoritesContainer.classList.toggle("show_favorites");

  // Check if there are any moveis in the Favorites, and if not then display a notification.
  if (!favoritesList.querySelector("li")) {
    const noFavoritesMessage = document.createElement("p");
    noFavoritesMessage.classList.add("no_favorites_message");
    noFavoritesMessage.innerHTML = `You don't have any saved favourite movies.<br />Press <i class="fa-solid fa-heart" style="color: rgb(229, 11, 20)"></i> on a movie to save it into Favourites.`;
    favoritesList.appendChild(noFavoritesMessage);
  } else if (favoritesList.querySelector("li")) {
    while (favoritesList.querySelector("p")) {
      favoritesList.querySelector("p").remove();
    }
  }

  // Hide Header element when Favorites are displayed, for styling reasons
  if (header.classList.contains("display_none")) {
    header.classList.remove("display_none");
  } else {
    setTimeout(() => {
      header.classList.add("display_none");
    }, 1000);
  }
};

/* 
Get random movies rendered in the moviesList Ul, as the user
 loads the website for the first time.
 */
randomMovieHandler();

/* 
Get any favorite movies that might be saved on the local storage.
 */
const favoriteMoviesFromLocalStorage = JSON.parse(
  localStorage.getItem("favorite_movies_array")
);

/* 
IF statement checks whether favoriteMoviesFromLocalStorage received any data from local storage,
and if so creates a Li element for each retrieved favorite movie, which is then pushed
into the favoritesArray array, to be at the end rendered by the renderFavorites() function.
 */
if (favoriteMoviesFromLocalStorage) {
  for (const movie of favoriteMoviesFromLocalStorage) {
    const newMovie = document.createElement("li");
    const newPicture = document.createElement("img");
    const newName = document.createElement("h2");
    const newDelete = document.createElement("button");

    newMovie.classList.add("favorite_movie_card");
    newMovie.setAttribute("data_id", +movie["favorite_data_id"]);
    newMovie.addEventListener("click", trashFavorite);

    newPicture.src = movie["favorite_image"];
    newPicture.classList.add("single_movie_image");

    newName.textContent = movie["favorite_name"];
    newName.classList.add("single_movie_name");

    newDelete.innerHTML = `<i class="fa-solid fa-heart-crack" style="pointer-events: none"></i>`;
    newDelete.classList.add("favorite_delete");

    newMovie.appendChild(newPicture);
    newMovie.appendChild(newName);
    newMovie.appendChild(newDelete);

    favoritesArray.push(newMovie);
  }
  renderFavorites(favoritesArray);
}

/* Event listeners */
// User uses the search bar (input) to search for movies using a relevant term
searchMovieInput.addEventListener("input", searchMovieHandler);
// User uses the "Get random movies!" option
randomMovies.addEventListener("click", randomMovieHandler);
// User uses the select to sort the movies from highest-to-lowest or
// lowest-to-highest rating, and then clicks 'Sort by ratings'.
sortBtn.addEventListener("click", sortMovies);
// User opens the list of favorite movies
favoritesLink.addEventListener("click", toggleFavorites);
// User closes the list of favorite movies
favoritesHide.addEventListener("click", toggleFavorites);
