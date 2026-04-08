(function () {
    // Bandera para evitar que el observer se dispare por cambios hechos por nosotros
    let isUpdating = false;

    // Espera a que Shopify esté listo y el carrito cargado
    function waitForCart(callback, maxAttempts = 50) {
        if (typeof window.Shopify !== 'undefined') {
            callback();
        } else if (maxAttempts > 0) {
            setTimeout(function () {
                waitForCart(callback, maxAttempts - 1);
            }, 50);
        } else {
            console.warn('No se pudo obtener el carrito de Shopify');
        }
    }

    function getcurrency() {
        const el = document.querySelector('[data-money-format]');
        if (el) return el.getAttribute('data-money-format');
    }

    function formatMoney(cents, format) {
        if (typeof cents === 'string') cents = cents.replace('.', '');
        cents = parseInt(cents, 10);

        let moneyFormat = format;
        if (!moneyFormat) {
            const el = document.querySelector('[data-money-format]');
            if (el) moneyFormat = el.getAttribute('data-money-format');
            else if (window.Shopify && window.Shopify.money_format) moneyFormat = window.Shopify.money_format;
            else moneyFormat = '${{amount}}';
        }

        let amount = cents / 100;
        let formattedAmount = amount.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        let formatted = moneyFormat.replace('{{amount}}', formattedAmount);
        if (moneyFormat.includes('{{amount_no_decimals}}')) {
            let amountNoDecimals = Math.floor(amount);
            let formattedNoDecimals = amountNoDecimals.toLocaleString('en-US');
            formatted = moneyFormat.replace('{{amount_no_decimals}}', formattedNoDecimals);
            formatted = formatted.replace('{{amount}}', formattedAmount);
        }
        return getcurrency() + formattedAmount;
    }

    function getConversionRate() {
        if (window.Shopify && window.Shopify.currency) {
            return window.Shopify.currency.rate;
        }
        return 1.0;
    }

    function updateShippingBar(barContainer) {
        // No hacer nada si estamos en medio de una actualización (para evitar recursión)
        if (isUpdating) return;

        console.log(!window.Shopify || !window.Shopify.cart || typeof window.Shopify.cart == 'undefined')

        // Verificar que el carrito exista SIN reintento recursivo (delegamos en waitForCart)
        if (!window.Shopify || !window.Shopify.cart || typeof window.Shopify.cart == 'undefined') {
            return; // Salir silenciosamente; la actualización se reintentará cuando el carrito esté listo
        }



        isUpdating = true;

        try {
            const conversionRate = getConversionRate();
            const thresholdCents = (parseFloat(barContainer.dataset.freeShippingThreshold) || 7500) * conversionRate;

            requestAnimationFrame(() => {
                const thresholdsTtext = Array.from(document.querySelectorAll('.threshold-text'));
                thresholdsTtext.forEach(el => {
                    el.innerHTML = formatMoney(parseFloat(barContainer.dataset.freeShippingThreshold) * conversionRate);
                });
            });

            const cartTotalBaseCents = window.Shopify.cart.total_price;
            const cartTotalCurrentCents = Math.round(cartTotalBaseCents);
            const remainingCents = thresholdCents - cartTotalCurrentCents;

            console.log(`${thresholdCents} - ${cartTotalCurrentCents}`)
            let percent = (cartTotalCurrentCents / thresholdCents) * 100;


            if (percent > 100) percent = 100;

            document.querySelectorAll('.threshold-text').forEach(el => {
                el.innerHTML = formatMoney(thresholdCents);
            });

            let progressBar = barContainer.querySelector('.fsb-progress-bar');
            const messageEl = barContainer.querySelector('.fsb-message-text');



            if (remainingCents <= 0) {
                requestAnimationFrame(() => {
                    barContainer.classList.add('free-shipping-achieved');
                    if (messageEl) messageEl.innerHTML = '🎉 Congratulations! You have free shipping 🎉';
                    if (progressBar) progressBar.style.width = '100%';
                });
            } else {
                requestAnimationFrame(() => {
                    barContainer.classList.remove('free-shipping-achieved');
                    const remainingFormatted = formatMoney(remainingCents);
                    if (messageEl) messageEl.innerHTML = `You're ${remainingFormatted} away from Free Standard Shipping`;
                    if (progressBar) progressBar.style.width = percent + '%';
                });
            }
        } catch (e) {
            console.log(e)
        } finally {
            // Pequeño retraso para liberar la bandera después de que las animaciones terminen
            setTimeout(() => { isUpdating = false; }, 200);
        }
    }

    function updateAllBars() {
        if (isUpdating) return;
        document.querySelectorAll('.free-shipping-bar').forEach(bar => updateShippingBar(bar));
    }

    function fetchCartAndUpdate() {
        fetch('/cart.js')
            .then(res => res.json())
            .then(cart => {
                if (window.Shopify) window.Shopify.cart = cart;
                updateAllBars();
            })
            .catch(err => console.error('Error fetching cart:', err));
    }

    function init() {
        if (!window.Shopify || !window.Shopify.cart) {
            fetchCartAndUpdate();
        } else {
            updateAllBars();
        }

        document.addEventListener('cart:update', function (e) {

            if (e.detail && e.detail.resource) {
                console.log('pasando e.detail.resource')
                window.Shopify.cart = e.detail.resource;
                updateAllBars();
            } else {
                fetchCartAndUpdate();
            }
        });

        document.addEventListener('currency:changed', function () {
            updateAllBars();
        });
    }

    // Observer optimizado: solo se activa cuando aparece la barra, y evita bucles
    function observeFreeShippingBar() {
        let initialized = false;
        const observer = new MutationObserver(function (mutations) {
            // Si estamos actualizando, ignoramos todas las mutaciones
            if (isUpdating) return;

            // Buscar si la barra ha sido añadida al DOM
            const barExists = document.querySelector('.free-shipping-bar');
            if (!initialized && barExists) {
                initialized = true;
                // Esperamos a que el carrito esté listo antes de inicializar
                waitForCart(init, 30);
            } else if (barExists && window.Shopify && window.Shopify.cart) {
                // Si la barra ya existe y el carrito está listo, actualizamos
                updateAllBars();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Usamos waitForCart en lugar de setTimeout para mayor confiabilidad
        waitForCart(() => {
            init();
        }, 50);
        observeFreeShippingBar();
    });


    window.updateFreeShippingBar = updateAllBars;
})();