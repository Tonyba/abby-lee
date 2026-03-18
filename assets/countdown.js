(function () {

    const countdown_date = document.querySelector('.countdown-container');
    if (!countdown_date) return;

    const selected_date = countdown_date.getAttribute('data-date') ?? '';
    const [day, month, year] = selected_date.split('/').map(Number);
    const dateObject = new Date(year ?? 1, (month ?? 1) - 1, day);

    const days = document.querySelector('[data-type="days"] .count-number');
    const hours = document.querySelector('[data-type="hours"] .count-number');
    const minutes = document.querySelector('[data-type="minutes"] .count-number');
    const seconds = document.querySelector('[data-type="seconds"] .count-number');



}());