
/* =========================================
   VIVERO — FUNCIONALIDADES DO SITE
   ========================================= */

/* -----------------------------------------
   1. PRODUTOS
   ----------------------------------------- */

// Produtos demonstrativos.
// Os nomes e preços poderão ser alterados
// quando definirmos o catálogo definitivo.

const products = [
    {
        id: 1,
        name: "Bolsa Horizonte",
        category: "bolsas",
        categoryLabel: "BOLSA",
        price: 149.90,
        color: "#858B52",
        shape: "H"
    },
    {
        id: 2,
        name: "Bolsa Travessia",
        category: "bolsas",
        categoryLabel: "BOLSA",
        price: 129.90,
        color: "#C66B4E",
        shape: "T"
    },
    {
        id: 3,
        name: "Organizador Rota",
        category: "organizadores",
        categoryLabel: "ORGANIZADOR",
        price: 69.90,
        color: "#344D3B",
        shape: "R"
    },
    {
        id: 4,
        name: "Nécessaire Campo",
        category: "organizadores",
        categoryLabel: "NÉCESSAIRE",
        price: 59.90,
        color: "#D9A441",
        shape: "C"
    }
];


/* -----------------------------------------
   2. ELEMENTOS DO HTML
   ----------------------------------------- */

const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("product-search");
const filterButtons = document.querySelectorAll(".filter-button");

const cartOverlay = document.getElementById("cart-overlay");
const openCartButton = document.getElementById("open-cart");
const closeCartButton = document.getElementById("close-cart");

const cartItemsContainer = document.getElementById("cart-items");
const cartCountElement = document.getElementById("cart-count");
const cartTotalElement = document.getElementById("cart-total");

const checkoutButton = document.getElementById("checkout-button");

const menuButton = document.getElementById("menu-button");
const navigation = document.querySelector(".navigation");

const newsletterForm = document.getElementById("newsletter-form");
const newsletterMessage = document.getElementById("newsletter-message");


/* -----------------------------------------
   3. CONFIGURAÇÕES
   ----------------------------------------- */

const STORAGE_KEY = "vivero-cart";

let activeFilter = "todos";
let searchTerm = "";
let cart = loadCart();


function formatPrice(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// Evita problemas ao recuperar dados do navegador.
function loadCart() {
    try {
        const savedCart = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        if (!Array.isArray(savedCart)) {
            return [];
        }

        const validatedCart = [];

        savedCart.forEach(item => {
            const product = products.find(
                product => product.id === Number(item.id)
            );

            const quantity = Number(item.quantity);

            if (
                product &&
                Number.isInteger(quantity) &&
                quantity > 0
            ) {
                const existing = validatedCart.find(
                    entry => entry.id === product.id
                );

                if (existing) {
                    existing.quantity += quantity;
                } else {
                    validatedCart.push({
                        id: product.id,
                        quantity
                    });
                }
            }
        });

        return validatedCart;

    } catch (error) {
        console.warn(
            "Não foi possível recuperar a sacola:",
            error
        );

        return [];
    }
}


function saveCart() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cart)
        );
    } catch (error) {
        console.warn(
            "Não foi possível salvar a sacola:",
            error
        );
    }
}


/* -----------------------------------------
   4. EXIBIÇÃO DOS PRODUTOS
   ----------------------------------------- */

function renderProducts() {

    if (!productGrid) return;

    const filteredProducts = products.filter(product => {

        const matchesCategory =
            activeFilter === "todos" ||
            product.category === activeFilter;

        const matchesSearch =
            product.name
                .toLowerCase()
                .includes(searchTerm);

        return matchesCategory && matchesSearch;
    });


    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <p class="no-products">
                Nenhum produto encontrado.
                Tente outra busca.
            </p>
        `;

        return;
    }


    productGrid.innerHTML = filteredProducts.map(product => `

        <article class="product-card">

            <div
                class="product-image"
                style="background-color: ${product.color};"
            >

                <div
                    class="product-shape"
                    style="
                        background-color: ${product.color};
                        border: 4px solid rgba(37,39,34,0.8);
                        border-radius: 12px 12px 35px 35px;
                        box-shadow: 12px 15px 20px rgba(0,0,0,0.15);
                    "
                >
                    ${product.shape}
                </div>

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.categoryLabel}
                </span>

                <h3>${product.name}</h3>

                <p class="product-price">
                    ${formatPrice(product.price)}
                </p>

                <button
                    class="add-to-cart"
                    data-add="${product.id}"
                >
                    ADICIONAR À SACOLA +
                </button>

            </div>

        </article>

    `).join("");
}


/* -----------------------------------------
   5. FILTROS DO CATÁLOGO
   ----------------------------------------- */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        activeFilter = button.dataset.filter;

        filterButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        renderProducts();

    });

});


/* -----------------------------------------
   6. BUSCA DE PRODUTOS
   ----------------------------------------- */

if (searchInput) {

    searchInput.addEventListener("input", () => {

        searchTerm = searchInput.value
            .trim()
            .toLowerCase();

        renderProducts();

    });

}


/* -----------------------------------------
   7. ADICIONAR À SACOLA
   ----------------------------------------- */

function addToCart(productId) {

    const product = products.find(
        item => item.id === productId
    );

    if (!product) return;

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart();
    renderCart();

}


// Evento delegado: funciona mesmo após
// os produtos serem recriados pelos filtros.

if (productGrid) {

    productGrid.addEventListener("click", event => {

        const button = event.target.closest("[data-add]");

        if (!button) return;

        const productId = Number(button.dataset.add);

        addToCart(productId);

        const originalText = button.textContent;

        button.textContent = "ADICIONADO ✓";

        button.disabled = true;

        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 900);

    });

}


/* -----------------------------------------
   8. REMOVER PRODUTOS DA SACOLA
   ----------------------------------------- */

function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );

    saveCart();
    renderCart();

}


if (cartItemsContainer) {

    cartItemsContainer.addEventListener("click", event => {

        const button = event.target.closest("[data-remove]");

        if (!button) return;

        const productId = Number(button.dataset.remove);

        removeFromCart(productId);

    });

}


/* -----------------------------------------
   9. ATUALIZAR A SACOLA
   ----------------------------------------- */

function renderCart() {

    if (!cartItemsContainer) return;

    let total = 0;
    let totalQuantity = 0;


    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <p class="empty-cart">
                Sua sacola está vazia.
            </p>
        `;

    } else {

        cartItemsContainer.innerHTML = cart.map(item => {

            const product = products.find(
                product => product.id === item.id
            );

            if (!product) return "";

            const subtotal = product.price * item.quantity;

            total += subtotal;
            totalQuantity += item.quantity;

            return `

                <div class="cart-item">

                    <div>
                        <strong>${product.name}</strong>

                        <p>
                            ${item.quantity} × ${formatPrice(product.price)}
                        </p>

                        <strong>
                            ${formatPrice(subtotal)}
                        </strong>
                    </div>

                    <button
                        type="button"
                        data-remove="${product.id}"
                        aria-label="Remover ${product.name} da sacola"
                    >
                        REMOVER
                    </button>

                </div>

            `;

        }).join("");

    }


    // Atualiza quantidade total.

    if (cartCountElement) {
        cartCountElement.textContent = totalQuantity;
    }


    // Atualiza subtotal.

    if (cartTotalElement) {
        cartTotalElement.textContent = formatPrice(total);
    }

}


/* -----------------------------------------
   10. ABRIR E FECHAR A SACOLA
   ----------------------------------------- */

function openCart() {

    if (!cartOverlay) return;

    cartOverlay.classList.add("open");

    document.body.style.overflow = "hidden";

}


function closeCart() {

    if (!cartOverlay) return;

    cartOverlay.classList.remove("open");

    document.body.style.overflow = "";

}


if (openCartButton) {
    openCartButton.addEventListener("click", openCart);
}


if (closeCartButton) {
    closeCartButton.addEventListener("click", closeCart);
}


// Fecha ao clicar fora do painel.

if (cartOverlay) {

    cartOverlay.addEventListener("click", event => {

        if (event.target === cartOverlay) {
            closeCart();
        }

    });

}


// Fecha com a tecla ESC.

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeCart();
        closeMobileMenu();
    }

});


/* -----------------------------------------
   11. MENU MOBILE
   ----------------------------------------- */

function closeMobileMenu() {

    if (!navigation || !menuButton) return;

    navigation.classList.remove("open");

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    menuButton.setAttribute(
        "aria-label",
        "Abrir menu"
    );

    menuButton.textContent = "☰";

}


if (menuButton && navigation) {

    menuButton.setAttribute("aria-expanded", "false");

    menuButton.addEventListener("click", () => {

        const isOpen = navigation.classList.toggle("open");

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Fechar menu" : "Abrir menu"
        );

        menuButton.textContent = isOpen ? "✕" : "☰";

    });


    // Fecha o menu após clicar em um link.

    navigation.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", closeMobileMenu);

    });

}


/* -----------------------------------------
   12. NEWSLETTER
   ----------------------------------------- */

if (newsletterForm) {

    newsletterForm.addEventListener("submit", event => {

        event.preventDefault();

        const emailInput = newsletterForm.querySelector(
            'input[type="email"]'
        );

        if (!emailInput || !emailInput.checkValidity()) {
            return;
        }

        newsletterMessage.textContent =
            "Obrigado! Sua inscrição foi registrada nesta demonstração.";

        newsletterMessage.style.color = "#344D3B";

        newsletterForm.reset();

    });

}


/* -----------------------------------------
   13. FINALIZAÇÃO DA COMPRA
   ----------------------------------------- */

if (checkoutButton) {

    checkoutButton.addEventListener("click", () => {

        if (cart.length === 0) {

            alert("Sua sacola está vazia!");

            return;

        }

        alert(
            "A VIVERO ainda está preparando seu checkout! " +
            "A integração de pagamento será adicionada em uma próxima etapa."
        );

    });

}


/* -----------------------------------------
   14. INICIALIZAÇÃO DO SITE
   ----------------------------------------- */

renderProducts();

renderCart();

console.log("VIVERO: site inicializado com sucesso!");
