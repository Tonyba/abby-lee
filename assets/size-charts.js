(function () {
    const switches = Array.from(document.querySelectorAll('.switch'));
    let currentUnit = 'cm'; // unidad inicial (debe coincidir con la unidad mostrada inicialmente)

    // Almacenar valores originales en pulgadas
    let originalValues = [];

    function init() {
        const cells = Array.from(document.querySelectorAll('.table-body > .flex > div'));
        // Asumimos que al inicio los valores están en la unidad actual (cm)
        // Convertimos esos valores a pulgadas como base
        cells.forEach((cell, index) => {
            const text = cell.textContent.trim();
            const parts = text.split('-');
            if (parts.length === 2) {
                let val1 = parseFloat(parts[0]);
                let val2 = parseFloat(parts[1]);
                if (!isNaN(val1) && !isNaN(val2)) {
                    let inVal1, inVal2;
                    if (currentUnit === 'cm') {
                        inVal1 = val1 / 2.54;
                        inVal2 = val2 / 2.54;
                    } else {
                        inVal1 = val1;
                        inVal2 = val2;
                    }
                    originalValues.push({ val1: inVal1, val2: inVal2 });
                } else {
                    originalValues.push({ val1: 0, val2: 0 });
                }
            } else {
                originalValues.push({ val1: 0, val2: 0 });
            }
        });
        // Aplicar la conversión a la unidad actual (para mostrar correctamente)
        updateDisplay();
    }

    function updateDisplay() {
        const cells = Array.from(document.querySelectorAll('.table-body > .flex > div'));
        if (cells.length !== originalValues.length) return;
        cells.forEach((cell, idx) => {
            const { val1, val2 } = originalValues[idx];
            let displayVal1, displayVal2;
            if (currentUnit === 'cm') {
                displayVal1 = val1 * 2.54;
                displayVal2 = val2 * 2.54;
            } else {
                displayVal1 = val1;
                displayVal2 = val2;
            }
            // Mostrar con 1 decimal por ejemplo, sin redondear bruscamente
            cell.textContent = `${Math.round(displayVal1 * 10) / 10} - ${Math.round(displayVal2 * 10) / 10}`;
        });
    }

    function switch_logic(type) {
        if (currentUnit === type) return;
        currentUnit = type;
        // Actualizar los textos de unidad en los elementos con clase 'unit'
        const type_unit = document.querySelectorAll('.unit');
        type_unit.forEach(unit => unit.textContent = type);
        updateDisplay();
    }

    switches.forEach(item => {
        item.addEventListener('click', function () {
            switches.forEach(it => it.classList.remove('active'));
            this.classList.add('active');
            switch_logic(this.id);
        });
    });

    init();
}());