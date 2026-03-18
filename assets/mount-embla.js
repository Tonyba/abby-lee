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

waitForEmbla(init);

function init() {
    const elms = document.querySelectorAll('.embla:not(.mounted)');
    elms.forEach((elm, i) => {

        const options = { loop: true, align: 'start' };

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

        const plugins = [];


        if (elm.classList.contains('centered')) options.align = 'center';

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