import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
// import MODEL_CLOSE_SEC from './config.js';

//////////////////////////////////////
// to make old browsers renders our application - installed -> npm i core-js regenerator-runtime
import 'core-js/stable'; // for polyfilling everything else
import 'regenerator-runtime/runtime'; // for polyfilling async/await
import { async } from 'regenerator-runtime';

// https://forkify-api.herokuapp.com/v2
///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultPage());

    // 1) updating bookmarks view 
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading Recipe from model.js
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);

  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get Search Quary
    const quary = searchView.getQuary();
    if (!quary) return;

    // 2) Loading Search Results
    await model.loadSearchResults(quary);

    // 3)  Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage());

    // 4) Render initial pagination btns
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotoPage) {
  console.log(gotoPage);
  // 3)  Render NEW results
  resultsView.render(model.getSearchResultPage(gotoPage));

  // 4) Render NEW pagination btns
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the Recipe View
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/Remove bookmark
  if (!model.state.recipe.bookmarked)
    model.addBookmark(model.state.recipe);
  else
    model.deleteBookmark(model.state.recipe.id);

  // Update Revipe View
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // render loading spinner
    addRecipeView.renderSpinner();

    // upload new recipe data
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success Message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change Id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, 2500);
  } catch (err) {
    console.error('^_^ ' + err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();