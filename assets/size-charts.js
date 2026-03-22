
(function () {

    const switches = Array.from(document.querySelectorAll('.switch'));

    switches.map((item) => {

        item.addEventListener('click', function () {
            switches.map((it) => it.classList.remove('active'))
            this.classList.add('active');
        });

    });

}());
