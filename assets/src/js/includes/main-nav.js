const hamburger = document.querySelector('#hamburger');

/**
 * Hamburger click event.
 * Toggle the active class when hamburger is clicked.
 */
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle("is-active");
});