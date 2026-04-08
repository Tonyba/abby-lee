(function () {
    // Espera a que Shopify esté listo y el carrito cargado
    function waitForCart(callback, maxAttempts = 50) {
        if (typeof window.Shopify != 'undefined') {
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

        // Convertir centavos a unidades monetarias
        let amount = cents / 100;

        // Formatear número con separadores de miles y sin decimales
        // Ej: 6900 -> "6,900"
        let formattedAmount = amount.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        // Reemplazar el placeholder {{amount}} en el formato
        let formatted = moneyFormat.replace('{{amount}}', formattedAmount);

        // Si el formato tiene {{amount_no_decimals}}, también lo manejamos
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
        // Datos del umbral (ya convertido a moneda actual en Liquid, en centavos)

        const conversionRate = getConversionRate();
        const thresholdCents = (parseFloat(barContainer.dataset.freeShippingThreshold) || 7500) * conversionRate;

        requestAnimationFrame(() => {
            const thresholdsTtext = Array.from(document.querySelectorAll('.threshold-text'));
            thresholdsTtext.forEach(el => {
                el.innerHTML = formatMoney(parseFloat(barContainer.dataset.freeShippingThreshold) * conversionRate);
            });
        });


        // Total del carrito en moneda base (centavos USD)
        const cartTotalBaseCents = window.Shopify.cart.total_price;
        // Convertir a moneda actual
        const cartTotalCurrentCents = Math.round(cartTotalBaseCents);
        console.log(`${thresholdCents} - ${cartTotalCurrentCents} = ${thresholdCents - cartTotalCurrentCents}`);
        const remainingCents = thresholdCents - cartTotalCurrentCents;
        let percent = (cartTotalCurrentCents / thresholdCents) * 100;
        if (percent > 100) percent = 100;

        // Actualizar elementos de texto de umbral (fuera de la barra, si existen)
        document.querySelectorAll('.threshold-text').forEach(el => {
            // Mostrar el umbral formateado (en la moneda actual)
            el.innerHTML = formatMoney(thresholdCents);
        });

        // Actualizar barra y mensaje
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
                console.log(remainingCents)
                const remainingFormatted = formatMoney(remainingCents);

                if (messageEl) messageEl.innerHTML = `You're ${remainingFormatted} away from Free Standard Shipping`;
                if (progressBar) progressBar.style.width = percent + '%';
            });
        }
    }

    function updateAllBars() {
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

        // Escuchar eventos de actualización del carrito
        document.addEventListener('cart:update', function (e) {
            if (e.detail && e.detail.resource) {
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

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => init(), 1000);
    });


    window.updateFreeShippingBar = updateAllBars;
})();