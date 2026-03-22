
(function () {

    const switches = Array.from(document.querySelectorAll('.switch'));

    switches.map((item) => {

        item.addEventListener('click', function () {
            switches.map((it) => it.classList.remove('active'))
            this.classList.add('active');
            switch_logic(this.id);
        });

    });

    function switch_logic(type) {

        const cells = document.querySelectorAll('.table-body > .flex > div');

        console.log(cells)

        if (type == 'cm') {

        } else {

        }
    }

}());
