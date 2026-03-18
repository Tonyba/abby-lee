(function () {
    // Seleccionamos todos los tabs y paneles
    const tabs = document.querySelectorAll('.tabs__tab');
    const panels = document.querySelectorAll('.tabs__panel');

    if (!tabs.length || !panels.length) return;

    // Función para activar una pestaña
    function activateTab(tabToActivate) {
        // Desactivar todas las pestañas
        tabs.forEach(tab => {
            tab.setAttribute('aria-selected', 'false');
        });

        // Ocultar todos los paneles
        panels.forEach(panel => {
            panel.setAttribute('hidden', '');
        });

        // Activar la pestaña clickeada
        tabToActivate.setAttribute('aria-selected', 'true');

        // Mostrar el panel correspondiente
        const panelId = tabToActivate.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.removeAttribute('hidden');
        }
    }

    // Asignar evento click a cada pestaña
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            activateTab(tab);
        });

        // Soporte para tecla Enter o Espacio (por defecto ya funciona en button)
        // Pero si usas elementos no interactivos, necesitarías manejarlo.
    });

    // Opcional: activar primera pestaña por si acaso (ya lo hicimos en HTML)
    // Pero asegurarnos que el estado inicial sea correcto:
    const activeTab = document.querySelector('.tabs__tab[aria-selected="true"]');
    if (!activeTab) {
        // Si no hay ninguna activa, activar la primera
        activateTab(tabs[0]);
    } else {
        // Asegurar que su panel esté visible (por si acaso)
        const panelId = activeTab.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        if (panel) panel.removeAttribute('hidden');
    }

    // Navegación con teclado (flechas izquierda/derecha)
    tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
            let newIndex;
            if (e.key === 'ArrowRight') {
                newIndex = (index + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft') {
                newIndex = (index - 1 + tabs.length) % tabs.length;
            } else {
                return; // salir si no es flecha
            }
            e.preventDefault();
            tabs[newIndex].focus();
            activateTab(tabs[newIndex]);
        });
    });
})();