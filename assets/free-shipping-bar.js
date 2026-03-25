(function () {

    console.log('free-shipping-exec')

    // Helper to format money without relying on Shopify.formatMoney
    // It reads the shop's money format from the DOM or uses a default.
    function formatMoney(cents, format) {
        if (typeof cents === 'string') cents = cents.replace('.', '');
        cents = parseInt(cents, 10);

        // Try to get the money format from the theme settings if available
        let moneyFormat = format;
        if (!moneyFormat) {
            // Attempt to read from the HTML element that Shopify often uses
            const moneyFormatElement = document.querySelector('[data-money-format]');
            if (moneyFormatElement) {
                moneyFormat = moneyFormatElement.getAttribute('data-money-format');
            } else {
                // Fallback: read from window.Shopify?.money_format if it exists
                if (window.Shopify && window.Shopify.money_format) {
                    moneyFormat = window.Shopify.money_format;
                } else {
                    // Default format: ${{amount}}
                    moneyFormat = '${{amount}}';
                }
            }
        }

        // Convert cents to dollars (with two decimal places)
        let amount = cents / 100;
        let formatted = moneyFormat.replace('{{amount}}', amount.toFixed(2));

        // If the format includes {{amount_no_decimals}} handle it
        /* if (moneyFormat.includes('{{amount_no_decimals}}')) {
          const amountNoDecimals = Math.floor(amount);
          formatted = moneyFormat.replace('{{amount_no_decimals}}', amountNoDecimals);
          formatted = formatted.replace('{{amount}}', amount.toFixed(2));
        }*/

        return formatted;
    }

    // Function to update the free shipping bar
    function updateFreeShippingBar() {

        const barContainer = Array.from(document.querySelectorAll('.free-shipping-bar'));

        if (!barContainer.length) return;

        barContainer.map(bar => handleShippingCart(bar));


    }

    function handleShippingCart(barContainer) {



        const threshold = parseFloat(barContainer.dataset.freeShippingThreshold) || 7500; // in cents

        // Get cart total from Shopify's cart data
        let cartTotal = 0;
        if (window.Shopify && window.Shopify.cart) {
            cartTotal = window.Shopify.cart.total_price;
        } else {
            // Fallback: read from DOM if available
            const cartTotalElement = document.querySelector('[data-cart-total]');
            if (cartTotalElement) {
                cartTotal = parseFloat(cartTotalElement.dataset.cartTotal);
            }
        }

        let remaining = threshold - cartTotal;
        let percent = (cartTotal / threshold) * 100;
        if (percent > 100) percent = 100;

        setTimeout(() => {
            if (remaining <= 0) {
                // Free shipping achieved
                barContainer.classList.add('free-shipping-achieved');
                const messageEl = barContainer.querySelector('.fsb-message-text');
                if (messageEl) messageEl.innerHTML = '🎉 Congratulations! You have free shipping 🎉';
                const progressBar = barContainer.querySelector('.fsb-progress-bar');
                if (progressBar) progressBar.style.width = '100%';
            } else {
                barContainer.classList.remove('free-shipping-achieved');
                const remainingFormatted = formatMoney(remaining);
                const messageEl = barContainer.querySelector('.fsb-message-text');
                if (messageEl) messageEl.innerHTML = `You're ${remainingFormatted}  away from Free Standard Shipping`;
                const progressBar = barContainer.querySelector('.fsb-progress-bar');
                if (progressBar) progressBar.style.width = percent + '%';
            }
        }, 100)


    }

    // Function to get cart data from Shopify AJAX API and update
    function fetchCartAndUpdate(cart) {
        if (cart?.total_price) {
            if (window.Shopify) window.Shopify.cart = cart;
            updateFreeShippingBar();
            return;
        }
        fetch('/cart.js')
            .then(response => response.json())
            .then(cart_fetched => {
                if (window.Shopify) window.Shopify.cart = cart_fetched;
                updateFreeShippingBar();
            })
            .catch(error => console.error('Error fetching cart:', error));
    }

    function initlogic() {

        // Set initial data from existing cart if available
        if (window.Shopify && window.Shopify.cart) {
            updateFreeShippingBar();
        } else {
            fetchCartAndUpdate(window.Shopify.cart);
        }

        // Listen for cart updates via AJAX (standard Shopify events)
        document.addEventListener('cart:update', function (e) {
            fetchCartAndUpdate(e.detail.resource);
        });

        // If the cart is updated via theme's own AJAX, they might not trigger our events.
        // As a fallback, we can observe mutations or use a simple interval.
        // Instead, we'll intercept the fetch of cart.js? That's heavy.
        // We'll rely on the fact that the theme should trigger 'cart:updated' after any cart change.
        // If not, we can provide an optional manual trigger for theme developers to call window.updateFreeShippingBar().
    }

    // Initial update on page load
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => initlogic(), 1000);
    });

    // Expose function globally so theme can manually trigger update if needed
    window.updateFreeShippingBar = updateFreeShippingBar;
})();