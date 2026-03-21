(function () {
    const get_current = window.location.href;
    const get__cat_elms = Array.from(document.querySelectorAll('.cat-menu a'));
    const baseUrl = window.location.origin;

    console.log(baseUrl)

    get__cat_elms.map(elm => {

        let href = elm.getAttribute('href');

        if (get_current.includes(href)) {
            elm.classList.add('active');
        }

    });
}());