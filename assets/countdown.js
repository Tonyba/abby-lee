(function () {

    const countdown_date = document.querySelector('.countdown-container');
    if (!countdown_date) return;

    const selected_date = countdown_date.getAttribute('data-date') ?? '';
    const [day, month, year] = selected_date.split('/').map(Number);
    const dateObject = new Date(year ?? 1, (month ?? 1) - 1, day);

    console.log(dateObject)
}());