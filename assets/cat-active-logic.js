(function () {
    const get_current = window.location.href;
    const get__cat_elms = Array.from(document.querySelectorAll('.cat-menu a'));
    const baseUrl = window.location.origin;

    get__cat_elms.map(elm => {

        let href = elm.getAttribute('href');

        if (get_current == baseUrl + href) {
            elm.classList.add('active');
        }


    });
}());