(function () {
    const get_current = window.location.href;
    const get__cat_elms = Array.from(document.querySelectorAll('.cat-menu a'));

    get__cat_elms.map(elm => {

        let href = elm.getAttribute('href');
        href = href?.replace('/blogs/news', '').trim();

        console.log(href, '=', get_current);

        if (get_current.includes(href)) {
            elm.classList.add('active');
        }

    });
}());