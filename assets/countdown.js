(function () {
    const countdown_date = document.querySelector('.countdown-container');
    if (!countdown_date) return;

    const selected_date = countdown_date.getAttribute('data-date') ?? '';
    const [day, month, year] = selected_date.split('/').map(Number);
    const targetDate = new Date(year ?? 1, (month ?? 1) - 1, day); // Fecha en hora local

    // Elementos del DOM donde se muestran los valores
    const daysEl = document.querySelector('[data-type="days"] .count-number');
    const hoursEl = document.querySelector('[data-type="hours"] .count-number');
    const minutesEl = document.querySelector('[data-type="minutes"] .count-number');
    const secondsEl = document.querySelector('[data-type="seconds"] .count-number');

    // Si algún elemento no existe, salimos
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now; // Diferencia en milisegundos

        // Si la fecha ya pasó, mostramos 00:00:00 y detenemos el intervalo
        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            clearInterval(intervalId);
            countdown_date?.classList.add('hide');
            return;
        }

        // Cálculos de tiempo
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Actualizar el DOM con formato de dos dígitos
        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }

    // Ejecutar inmediatamente para mostrar el valor inicial
    updateCountdown();

    // Actualizar cada segundo
    const intervalId = setInterval(updateCountdown, 1000);
}());