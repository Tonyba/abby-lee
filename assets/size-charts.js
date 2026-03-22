
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

        const cells = Array.from(document.querySelectorAll('.table-body > .flex > div'));
        const type_unit = Array.from(document.querySelectorAll('.unit'));

        type_unit.map((unit) => unit.textContent = type);

        if (type == 'cm') {

        } else {
            cells.map((cell) => {
                const values = cell.textContent.split('-');
                console.log(values)
            });
        }
    }

}());
