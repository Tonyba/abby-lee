function waitForEmbla(method) {
    if (typeof EmblaCarousel != 'undefined') {
        method();
    } else {
        setTimeout(function () { waitForEmbla(method) }, 50);
    }
}

function waitForAutoscroll(method) {
    if (typeof EmblaCarouselAutoScroll != 'undefined') {
        method();
    } else {
        setTimeout(function () { waitForAutoscroll(method) }, 50);
    }
}

emblaMobile();
waitForEmbla(init);

function init() {


    const elms = document.querySelectorAll('.embla:not(.mounted)');
    elms.forEach((elm, i) => {

        
        const options = { loop: true, align: 'start' };

        const plugins = [];


        if (elm.classList.contains('embla--only-tablet')) {
            options.breakpoints = {
                '(min-width: 1024px)': { active: false }
            };
        }

        if (elm.classList.contains('embla--only-mobile')) {
            options.breakpoints = {
                '(min-width: 768px)': { active: false }
            };
        }

        if (elm.classList.contains('centered')) options.align = 'center';

        if( elm.classList.contains('story-embla') ) {

            const rightCol = document.querySelector('.hotspots-container-custom');
            
            const embla_viewport =  rightCol.querySelector('.group-block-content');
            const embla__container = document.createElement('div');
          

            rightCol.classList.add('embla');
            rightCol.classList.add('mounted');
            rightCol.classList.add('cols-1');
            embla_viewport.classList.add('embla__viewport');
            embla__container.classList.add('embla__container');
            embla__container.classList.add('w-100');


            embla__container.append(embla_viewport.children[0]);
            embla_viewport.append(embla__container);


            const rightColApi  =  mountCarousel(rightCol, options, plugins)
            const mainApi =  mountCarousel(elm, options, plugins);

            return;
        }
    
 


        if (elm.classList.contains('autoscroll')) {
            waitForAutoscroll(function () {
                plugins.push(EmblaCarouselAutoScroll({
                    speed: 0.8
                }));
                mountCarousel(elm, options, plugins)
            })
        } else {
            mountCarousel(elm, options, plugins)
        }



    });

}

function embla_conversion_mobile() {
    const containers = Array.from(document.querySelectorAll('.convert-embla-m'));
    const sections = Array.from(document.querySelectorAll('.convert-section-embla-m'));

    containers.map((elm) => {
        elm.classList.add('embla');
        if (!elm.querySelector('.embla__viewport')) {

            const embla_viewport = document.createElement('div');
            const embla__container = elm.querySelector('.group-block-content');
            


            embla__container?.classList.add('embla__container');

            embla_viewport.classList.add('embla__viewport');
            elm?.append(embla_viewport);

            embla_viewport.append(embla__container);

            /*
            embla_container.classList.add('embla__container');
            embla__viewport?.classList.add('embla__viewport');*/
        }


    });

    sections.map((elm) => {
        elm.classList.add('embla');
        elm.querySelector('.custom-section-content')?.classList.add('embla__viewport');
        elm.querySelector('.layout-panel-flex')?.classList.add('embla__container');
    });

}

function emblaMobile() {
    const emblaTablet = Array.from(document.querySelectorAll('.embla-tablet'));
    const emblaMobile = Array.from(document.querySelectorAll('.embla-m'));
    const w = window.outerWidth;

    if (w < 1025) emblaTablet.map(el => el.classList.add('embla'));
    if (w < 768) {
        embla_conversion_mobile();
        emblaMobile.map(el => el.classList.add('embla'));
    }
}

function mountCarousel(elm, options, plugins) {

    elm.classList.add('mounted');

    const viewportNode = elm.querySelector('.embla__viewport')
    const emblaApi = EmblaCarousel(viewportNode, options, plugins);

    const dotsNode = elm.querySelector('.embla__dots');
    const prevBtnNode = elm.querySelector('.embla__button--prev');
    const nextBtnNode = elm.querySelector('.embla__button--next');



    const removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
        emblaApi,
        dotsNode
    );

    if (prevBtnNode && nextBtnNode) {
        const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
            emblaApi,
            prevBtnNode,
            nextBtnNode
        );
        emblaApi.on('destroy', removePrevNextBtnsClickHandlers);
    }



    emblaApi.on('destroy', removeDotBtnsAndClickHandlers);


    return emblaApi;
}

function addTogglePrevNextBtnsActive(emblaApi, prevBtn, nextBtn) {
    const togglePrevNextBtnsState = () => {
        if (emblaApi.canScrollPrev()) prevBtn.removeAttribute('disabled')
        else prevBtn.setAttribute('disabled', 'disabled')

        if (emblaApi.canScrollNext()) nextBtn.removeAttribute('disabled')
        else nextBtn.setAttribute('disabled', 'disabled')
    }

    emblaApi
        .on('select', togglePrevNextBtnsState)
        .on('init', togglePrevNextBtnsState)
        .on('reInit', togglePrevNextBtnsState)

    return () => {
        prevBtn.removeAttribute('disabled')
        nextBtn.removeAttribute('disabled')
    }
}


function addPrevNextBtnsClickHandlers(emblaApi, prevBtn, nextBtn) {
    const scrollPrev = () => {
        emblaApi.scrollPrev()
    }
    const scrollNext = () => {
        emblaApi.scrollNext()
    }
    prevBtn.addEventListener('click', scrollPrev, false)
    nextBtn.addEventListener('click', scrollNext, false)

    const removeTogglePrevNextBtnsActive = addTogglePrevNextBtnsActive(
        emblaApi,
        prevBtn,
        nextBtn
    )

    return () => {
        removeTogglePrevNextBtnsActive()
        prevBtn.removeEventListener('click', scrollPrev, false)
        nextBtn.removeEventListener('click', scrollNext, false)
    }
}

function addDotBtnsAndClickHandlers(emblaApi, dotsNode) {
    let dotNodes = []
    if (!dotsNode) return;
    const addDotBtnsWithClickHandlers = () => {


        dotsNode.innerHTML = emblaApi
            .scrollSnapList()
            .map(() => '<button class="embla__dot" type="button"></button>')
            .join('')

        const scrollTo = (index) => {
            emblaApi.scrollTo(index)
        }

        dotNodes = Array.from(dotsNode.querySelectorAll('.embla__dot'))
        dotNodes.forEach((dotNode, index) => {
            dotNode.addEventListener('click', () => scrollTo(index), false)
        })
    }

    const toggleDotBtnsActive = () => {
        const previous = emblaApi.previousScrollSnap()
        const selected = emblaApi.selectedScrollSnap()
        dotNodes[previous].classList.remove('embla__dot--selected')
        dotNodes[selected].classList.add('embla__dot--selected')
    }

    emblaApi
        .on('init', addDotBtnsWithClickHandlers)
        .on('reInit', addDotBtnsWithClickHandlers)
        .on('init', toggleDotBtnsActive)
        .on('reInit', toggleDotBtnsActive)
        .on('select', toggleDotBtnsActive)

    return () => {
        dotsNode.innerHTML = ''
    }
}