(function () {

    const img_cols = document.querySelectorAll('.prod-img-col');

    console.log(img_cols)

    Array.from(img_cols).map(img => {
        const image = img.querySelector('.image-block');
        if (image?.querySelector('svg')) image.classList.add('hide');

    });

})();