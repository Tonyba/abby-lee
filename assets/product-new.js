(function () {

    const img_cols = document.querySelectorAll('.prod-img-col');


    Array.from(img_cols).map(img => {

        const image = img.querySelector('.image-block');
        console.log(image?.querySelector('.placeholder-image'))
        if (image?.querySelector('.placeholder-image')) image.classList.add('hide');

    });

})();