
(function () {

    const switches = Array.from(document.querySelectorAll('.switch'));
    let currentUnit = 'cm';

    switches.map((item) => {

        item.addEventListener('click', function () {
            switches.map((it) => it.classList.remove('active'))
            this.classList.add('active');
            switch_logic(this.id);
        });

    });

    function switch_logic(type) {

        if (currentUnit == type) return;

        currentUnit = type;

        const cells = Array.from(document.querySelectorAll('.table-body > .flex > div'));
        const type_unit = Array.from(document.querySelectorAll('.unit'));

        type_unit.map((unit) => unit.textContent = type);

        if (type == 'cm') {

            cells.map((cell) => {
                const values = cell.textContent.split('-');

                let first_value = parseInt(values[0]?.trim());
                let second_value = parseInt(values[1]?.trim());

                first_value = first_value * 2.54;
                second_value = second_value * 2.54;

                cell.textContent = `${first_value} - ${second_value}`;

            });

        } else {
            cells.map((cell) => {
                const values = cell.textContent.split('-');

                let first_value = parseInt(values[0]?.trim());
                let second_value = parseInt(values[1]?.trim());

                first_value = first_value / 2.54;
                second_value = second_value / 2.54;

                cell.textContent = `${first_value} - ${second_value}`;

            });
        }
    }

}());
