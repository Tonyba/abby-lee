(function () {

    document.addEventListener('DOMContentLoaded', function () {

        setTimeout(() => {

            const megaContent = document.querySelector('.mega-menu-about');
            const megaTarget = document.querySelector('[data-menu-grid-id="MegaMenuList-3"]  .mega-menu__content');

            megaContent?.classList.remove('hide');
            megaTarget?.appendChild(megaContent);
        }, 1000);

    })

}());