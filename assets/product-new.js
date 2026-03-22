(function () {

    const img_cols = document.querySelectorAll('.prod-img-col');


    Array.from(img_cols).map(img => {

        const image = img.querySelector('.image-block');
        console.log(image?.querySelector('.hero__media'))
        if (image?.querySelector('.hero__media')) image.classList.add('hide');

    });

})();