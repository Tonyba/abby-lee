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

        if (!window.Shopify || !window.Shopify.cart || typeof window.Shopify.cart.total_price === 'undefined') {
            console.warn('Carrito no disponible aún');
            return;
        }

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

    // ----- SOLUCIÓN PARA EL COMPONENTE DINÁMICO -----
    // Observa el DOM para detectar cuándo aparece el elemento .free-shipping-bar
    // y entonces ejecuta init (o actualiza las barras). También se vuelve a ejecutar
    // si el contenido del componente cambia y la barra se vuelve a insertar.
    function observeFreeShippingBar() {
        const targetNode = document.body; // o podrías usar document.querySelector('cart-items-component') si quieres más específico
        const config = { childList: true, subtree: true };
        let initialized = false;

        const callback = function (mutationsList, observer) {
            // Si ya existe al menos una barra y aún no hemos inicializado, inicializamos
            if (!initialized && document.querySelector('.free-shipping-bar')) {
                initialized = true;
                // Esperamos un poco más para asegurar que el componente haya terminado de pintar
                setTimeout(() => {
                    init();
                }, 100);
            } else if (document.querySelector('.free-shipping-bar')) {
                // Si ya está inicializado pero la barra se reemplazó (por ejemplo, al cambiar de página o actualizar carrito),
                // actualizamos sus valores
                updateAllBars();
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    // Inicialización tradicional con DOMContentLoaded + setTimeout (lo mantienes)
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => init(), 1000);
        // Además, activamos el observer para capturar casos donde la barra aparece más tarde
        observeFreeShippingBar();
    });

    window.updateFreeShippingBar = updateAllBars;
})();