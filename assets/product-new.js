(function () {

    const img_cols = document.querySelectorAll('.prod-img-col .img-block');

    Array.from(img_cols).map(img => {
        const no_image = img.querySelector('svg');
        console.log(no_image)
        if (!no_image) img.classList.add('hide');
    });

})();