(function () {
    const get_current = window.location.href;
    const get__cat_elms = Array.from(document.querySelectorAll('.cat-menu a'));
    const baseUrl = window.location.origin + '/blogs/news';

    console.log(baseUrl)

    get__cat_elms.map(elm => {

        let href = elm.getAttribute('href');

        console.log(baseUrl, '=', (baseUrl + href));

        if (baseUrl == baseUrl + href) {
            elm.classList.add('active');
        }


    });
}());