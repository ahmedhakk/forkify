import { API_URL, KEY } from "./config.js";
import { RES_PER_PAGE } from "./config.js";
// import { getJSON, sendJSON } from "./helper.js";
import { AJAX } from "./helper.js";

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: [],
};

const createRecipeObject = function (data) {
    const { recipe } = data.data; // data.data.recipe

    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key }),
    };
};

export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
        state.recipe = createRecipeObject(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id)) // return true / false
            state.recipe.bookmarked = true;
        else
            state.recipe.bookmarked = false;

        // console.log(state.recipe);
    } catch (err) {
        // Temp err handling
        console.error(`${err} 🎇🎇🎇`);
        throw err;
    }
};

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        // console.log(data);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key }),
            };
        });
        state.search.page = 1;
    } catch (err) {
        console.error(`${err} 🎇🎇🎇`);
        throw err;
    }
};

export const getSearchResultPage = function (page = state.search.page) {
    state.search.page = page;
    // const start = (page - 1) * 10; // 0 -> page = 1 => (1-1) * 10 = 0
    // const end = page * 10; // 9 -> page = 1 => (1 * 10) = 10
    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;
    return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
        // newQuantity = oldQuantity * newServings / oldServings  =>  2 * 8 / 4 = 4
    });
    state.recipe.servings = newServings;
};

const persistBookmarks = function () {
    // localStorage.setItem(key: string, value: string)
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks)); // JSON.stringify(state.bookmarks) -> object that we need to convet to a string
};

// Common pattern that when we add something we recive all data, when we delete it we need just the id
export const addBookmark = function (recipe) {
    // add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmarked
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmarks();
};

export const deleteBookmark = function (id) {
    // delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);
    // OR
    // state.bookmarks = state.bookmarks.filter(el => el.id !== id);

    // Mark current recipe as NOT bookmarked
    if (id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookmarks()
};

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage); // to convert the string back to a object
};
init();

const clearBookmarks = function () {
    localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
    try {
        // console.log(Object.entries(newRecipe));
        const ingredients = Object.entries(newRecipe) // to convert an object to an array
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                const ingArr = ing[1].split(',').map(el => el.trim());
                // const ingArr = ing[1].replaceAll(' ', '').split(',');
                if (ingArr.length !== 3)
                    throw new Error('Wrong Ingredient Format! Please use correct format :)');

                const [quantity, unit, description] = ingArr;
                return { quantity: quantity ? +quantity : null, unit, description };
            });

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };
        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (err) {
        throw err;
    }
};