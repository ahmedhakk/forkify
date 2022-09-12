import View from './view.js';
import previewView from './previewView.js';
import icons from 'url:../../img/icons.svg';

class ResultsView extends View {
    _parentElement = document.querySelector('.results');
    _errorMessage = 'No recipes found for your query!, Please Try Again :)';
    _message = '';

    _generateMarkup() {
        // console.log(this._data); // [{…}, {…}, ...]
        return this._data.map(result => previewView.render(result, false)).join('');
        // return this._data.map(rec => this._generateMarkupPreview(rec)).join('');
    }
}

export default new ResultsView();