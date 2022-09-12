import View from './view.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination');

    addHandlerClick(handler) {
        this._parentElement.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn--inline');
            if (!btn) return;

            const goToPage = +btn.dataset.goto;
            handler(goToPage);
        })
    }

    _generateMarkup() {
        const curPage = this._data.page;
        const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);

        // Next btn fun 
        const generateMarkupBtnNext = (curP) => {
            return `
                <button data-goto="${curP + 1}" class="btn--inline pagination__btn--next">
                    <span>Page ${curP + 1}</span>
                    <svg class="search__icon">
                        <use href="${icons}#icon-arrow-right"></use>
                    </svg>
                </button>
            `;
        };

        // prev btn fun 
        const generateMarkupBtnPrev = (curP) => {
            return `
                <button data-goto="${curP - 1}" class="btn--inline pagination__btn--prev">
                    <svg class="search__icon">
                        <use href="${icons}#icon-arrow-left"></use>
                    </svg>
                    <span>Page ${curP - 1}</span>
                </button>
            `;
        };

        // page 1, and there are other pages
        if (curPage === 1 && numPages > 1) {
            return `${generateMarkupBtnNext(curPage)}`;
        };

        // last page
        if (curPage === numPages && numPages > 1) {
            return `${generateMarkupBtnPrev(curPage)}`;
        };

        // other page
        if (curPage < numPages) {
            return `
                ${generateMarkupBtnPrev(curPage)}
                ${generateMarkupBtnNext(curPage)}
            `;
        };

        // page 1, and there no other pages
        return '';
    }
};

export default new PaginationView();