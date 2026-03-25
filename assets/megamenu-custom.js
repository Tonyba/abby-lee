(function () {
    const megaContent = document.querySelector('.mega-menu-about');
    const megaTarget = document.querySelector('[data-menu-grid-id="MegaMenuList-3"]  .mega-menu__content');

    console.log(megaContent)
    megaTarget?.append(megaContent);
}());