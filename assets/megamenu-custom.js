(function () {


    waitForElm('[data-menu-grid-id="MegaMenuList-3"]  .mega-menu__content').then((megaTarget) => {

        setTimeout(() => {
            setTimeout(() => {
                const megaContent = document.querySelector('.mega-menu-about');
                megaContent?.classList.remove('hide');
                megaTarget?.appendChild(megaContent);
            }, 500)

        }, 500);
    });

    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

}());