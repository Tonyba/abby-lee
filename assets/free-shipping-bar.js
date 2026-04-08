(function () {
    // Helper to format money (centavos en la moneda actual)
    function formatMoney(cents, format) {
        if (typeof cents === 'string') cents = cents.replace('.', '');
        cents = parseInt(cents, 10);

        let moneyFormat = format;
        if (!moneyFormat) {
            const moneyFormatElement = document.querySelector('[data-money-format]');
            if (moneyFormatElement) {
                moneyFormat = moneyFormatElement.getAttribute('data-money-format');
            } else if (window.Shopify && window.Shopify.money_format) {
                moneyFormat = window.Shopify.money_format;
            } else {
                moneyFormat = '${{amount}}';
            }
        }

        let amount = cents / 100;
        let formatted = moneyFormat.replace('{{amount}}', amount.toFixed(2));
        return formatted;
    }

    // Actualiza una barra específica (con setTimeout para la animación)
    function handleShippingCart(barContainer) {
        // Leer umbral convertido (centavos en moneda actual)
        const threshold = parseFloat(barContainer.dataset.freeShippingThreshold) || 7500;
        // Leer tasa de conversión (USD -> moneda actual)
        const conversionRate = parseFloat(barContainer.dataset.conversionRate) || 1.0;

        // Obtener total del carrito en moneda base (centavos)
        let cartTotalBase = 0;
        if (window.Shopify && window.Shopify.cart) {
            cartTotalBase = window.Shopify.cart.total_price;
        } else {
            const cartTotalElement = document.querySelector('[data-cart-total]');
            if (cartTotalElement) {
                cartTotalBase = parseFloat(cartTotalElement.dataset.cartTotal);
            }
        }

        // Convertir total a la moneda actual (centavos)
        const cartTotalCurrent = Math.round(cartTotalBase * conversionRate);
        const remaining = threshold - cartTotalCurrent;
        let percent = (cartTotalCurrent / threshold) * 100;
        if (percent > 100) percent = 100;

        // Aplicar setTimeout para asegurar que el DOM esté listo y la animación se ejecute
        setTimeout(() => {
            // Volvemos a obtener los elementos por si acaso (como en el original)
            const currentBar = document.querySelector('.free-shipping-bar');
            const progressBar = currentBar ? currentBar.querySelector('.fsb-progress-bar') : null;
            const messageEl = currentBar ? currentBar.querySelector('.fsb-message-text') : null;

            if (remaining <= 0) {
                if (currentBar) currentBar.classList.add('free-shipping-achieved');
                if (messageEl) messageEl.innerHTML = '🎉 Congratulations! You have free shipping 🎉';
                if (progressBar) {
                    progressBar.style.width = '100%';
                    // Pequeño timeout adicional para forzar la transición si es necesario
                    setTimeout(() => { progressBar.style.width = '100%'; }, 50);
                }
            } else {
                if (currentBar) currentBar.classList.remove('free-shipping-achieved');
                const remainingFormatted = formatMoney(remaining);
                if (messageEl) messageEl.innerHTML = `You're ${remainingFormatted} away from Free Standard Shipping`;
                if (progressBar) {
                    progressBar.style.width = percent + '%';
                    setTimeout(() => { progressBar.style.width = percent + '%'; }, 50);
                }
            }
        }, 100); // El timeout original era 100ms
    }

    // Actualiza todas las barras de envío gratuito
    function updateFreeShippingBar() {
        const barContainers = document.querySelectorAll('.free-shipping-bar');
        if (!barContainers.length) return;
        barContainers.forEach(bar => handleShippingCart(bar));
    }

    // Obtiene el carrito desde la API de Shopify y actualiza
    function fetchCartAndUpdate(cart) {
        if (cart && cart.total_price !== undefined) {
            if (window.Shopify) window.Shopify.cart = cart;
            updateFreeShippingBar();
            return;
        }

        fetch('/cart.js')
            .then(response => response.json())
            .then(cartFetched => {
                if (window.Shopify) window.Shopify.cart = cartFetched;
                updateFreeShippingBar();
            })
            .catch(error => console.error('Error fetching cart:', error));
    }

    // Inicialización con setTimeout (como en el original)
    function init() {
        if (window.Shopify && window.Shopify.cart) {
            updateFreeShippingBar();
        } else {
            fetchCartAndUpdate();
        }

        document.addEventListener('cart:update', function (e) {
            fetchCartAndUpdate(e.detail.resource);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => init(), 1000); // Mantenemos el timeout de 1 segundo
    });

    window.updateFreeShippingBar = updateFreeShippingBar;
})();