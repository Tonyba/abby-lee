(function () {

    const countdown_date = document.querySelector('.countdown-container');
    const selected_date = Date.parse(countdown_date?.getAttribute('data-date'));

    console.log(selected_date)
}());