const DEFAULT_PRODUCTS = [
    {
        id: "prod-1",
        title: "Samsung Ultra Smart Watch",
        price: 1799.99,
        image: "photos/Samsung Galaxy Watch_ Premium Design & Advanced Fitness Tracking ⌚✨.jpg",
        meta: "Color: Midnight Black | Size: 44mm"
    },
    {
        id: "prod-2",
        title: "Asus Elitebook",
        price: 70299.99,
        image: "photos/laptop.jpg",
        meta: "Storage: 1TB SSD | RAM: 32GB"
    },
    {
        id: "prod-3",
        title: "Sony Headphones",
        price: 999.00,
        image: "photos/WhatsApp Image 2026-08-23 at 5.47.25 PM.jpeg",
        meta: "Color: Matte Black"
    },
    {
        id: "prod-4",
        title: "iPhone 17 Pro",
        price: 5449.99,
        image: "photos/dea02608-bf89-4cf7-ade3-4e427650598a.jpg",
        meta: "Color: Space Gray | Storage: 256GB"
    }
];

const PROMO_CODES = {
    "VOLTX15": 0.15,
    "VOLTX10": 0.10,
    "SAVE10": 0.10
};

function getCart() {
    return JSON.parse(localStorage.getItem('voltx_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('voltx_cart', JSON.stringify(cart));
    updateCartBadges();
}

function getUsers() {
    return JSON.parse(localStorage.getItem('voltx_users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('voltx_users', JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('voltx_current_user')) || null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('voltx_current_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('voltx_current_user');
    }
}

/**
 * Promise-based Helper Function:
 * Simulates an asynchronous payment gateway API request.
 */
function processPaymentApi(paymentDetails) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!paymentDetails || !paymentDetails.amount) {
                reject(new Error("Invalid payment details provided."));
                return;
            }

            // Simulate 95% API success rate
            const isSuccess = Math.random() < 0.95;

            if (isSuccess) {
                resolve({
                    status: 200,
                    transactionId: "TXN_" + Math.floor(100000 + Math.random() * 900000)
                });
            } else {
                reject(new Error("Payment processing failed. Please verify your details and try again."));
            }
        }, 1500);
    });
}

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    
    const savedTheme = localStorage.getItem('voltx-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
        root.setAttribute('data-theme', 'light');
    } else {
        root.removeAttribute('data-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = root.getAttribute('data-theme') === 'light';
            if (isLight) {
                root.removeAttribute('data-theme');
                localStorage.setItem('voltx-theme', 'dark');
            } else {
                root.setAttribute('data-theme', 'light');
                localStorage.setItem('voltx-theme', 'light');
            }
        });
    }
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'error' ? 'var(--pink, #ff3d81)' : 'var(--surface-raised, #1e1a14)'};
        color: var(--text, #f5f0e8);
        border: 1px solid var(--border, #2c2620);
        border-left: 4px solid ${type === 'error' ? '#ff3d81' : 'var(--orange, #ff6b1a)'};
        padding: 12px 20px;
        border-radius: 8px;
        font-family: var(--font-display, sans-serif);
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateCartBadges() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.nav-links a[href*="cart.html"]').forEach(link => {
        let badge = link.querySelector('.cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.style.cssText = `
                background: var(--orange, #ff6b1a);
                color: #000;
                font-size: 0.75rem;
                font-weight: 700;
                padding: 2px 7px;
                border-radius: 999px;
                margin-left: 6px;
                vertical-align: middle;
            `;
            link.appendChild(badge);
        }
        badge.textContent = count;
    });
}

function addToCart(productData) {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === productData.id || item.title === productData.title);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...productData, quantity: 1 });
    }

    saveCart(cart);
    showToast(`Added ${productData.title} to cart!`);
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // Check if user just logged out via hash or flag
    if (window.location.hash === '#logout-success' || localStorage.getItem('voltx_just_logged_out') === 'true') {
        localStorage.removeItem('voltx_just_logged_out');
        showToast('You have been logged out successfully.');
        if (window.location.hash === '#logout-success') {
            history.replaceState(null, null, ' ');
        }
    }

    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navBackdrop = document.getElementById('navBackdrop');

    function setMenu(isOpen) {
        if (!navLinks || !navToggle) return;
        navLinks.classList.toggle('open', isOpen);
        navToggle.classList.toggle('active', isOpen);
        if (navBackdrop) navBackdrop.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (navToggle) navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
    if (navBackdrop) navBackdrop.addEventListener('click', () => setMenu(false));
    if (navLinks) navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

    const currentUser = getCurrentUser();
    document.querySelectorAll('.nav-links').forEach(nav => {
        const signupBtn = nav.querySelector('a[href*="signup.html"]');
        const logoutBtn = nav.querySelector('a[href*="logout.html"]');

        if (currentUser) {
            if (signupBtn) signupBtn.parentElement.style.display = 'none';
            if (logoutBtn) {
                logoutBtn.parentElement.style.display = 'block';
                logoutBtn.textContent = `Logout (${currentUser.fullname || 'User'})`;
            }
        } else {
            if (signupBtn) signupBtn.parentElement.style.display = 'block';
            if (logoutBtn) logoutBtn.parentElement.style.display = 'none';
        }
    });

    updateCartBadges();

    initHomePage();
    initCartPage();
    initSignupPage();
    initSigninPage();
    initLogoutPage();
});

function initHomePage() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.querySelectorAll('.product-card').forEach((card, index) => {
        const btn = card.querySelector('.buy-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const title = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : `Product ${index + 1}`;
                const priceText = card.querySelector('.price') ? card.querySelector('.price').textContent.replace(/[^0-9.]/g, '') : '0';
                const price = parseFloat(priceText) || 0;
                const image = card.querySelector('img') ? card.querySelector('img').getAttribute('src') : '';

                const productData = {
                    id: DEFAULT_PRODUCTS[index] ? DEFAULT_PRODUCTS[index].id : `custom-prod-${index}`,
                    title: title,
                    price: price,
                    image: image,
                    meta: DEFAULT_PRODUCTS[index] ? DEFAULT_PRODUCTS[index].meta : 'Standard Edition'
                };

                addToCart(productData);
            });
        }
    });
}

function initCartPage() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;

    let appliedDiscount = 0;

    function renderCart() {
        const cart = getCart();
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); width: 100%;">
                    <h2>Your cart is currently empty</h2>
                    <p style="color: var(--text-muted); margin: 1rem 0 1.5rem;">Discover our latest electronics and add items to your cart.</p>
                    <a href="./index.html#products" class="cta-button">Browse Products</a>
                </div>
            `;
            calculateTotals(0, 0);
            return;
        }

        let subtotal = 0;

        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;

            const article = document.createElement('article');
            article.className = 'cart-item';
            article.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="item-details">
                    <h3>${item.title}</h3>
                    <p class="item-meta">${item.meta || ''}</p>
                    <span class="item-price">Rs ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div class="item-actions">
                    <div class="quantity-control">
                        <button type="button" class="qty-btn" data-action="decrease" data-index="${index}" aria-label="Decrease quantity">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" class="qty-btn" data-action="increase" data-index="${index}" aria-label="Increase quantity">+</button>
                    </div>
                    <button type="button" class="remove-btn" data-index="${index}" aria-label="Remove item">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(article);
        });

        calculateTotals(subtotal, appliedDiscount);
    }

    function calculateTotals(subtotal, discountRate) {
        const discountVal = subtotal * discountRate;
        const netSubtotal = subtotal - discountVal;
        const shipping = netSubtotal > 0 ? (netSubtotal > 50000 ? 0 : 250) : 0;
        const tax = netSubtotal * 0.05;
        const grandTotal = netSubtotal + shipping + tax;

        const summaryBox = document.querySelector('.cart-summary');
        if (!summaryBox) return 0;

        const summaryRows = summaryBox.querySelectorAll('.summary-row');
        if (summaryRows.length >= 3) {
            summaryRows[0].querySelector('span:last-child').textContent = `Rs ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            summaryRows[1].querySelector('span:last-child').textContent = shipping === 0 ? 'FREE' : `Rs ${shipping.toFixed(2)}`;
            summaryRows[2].querySelector('span:last-child').textContent = `Rs ${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        const totalRow = summaryBox.querySelector('.total-row span:last-child');
        if (totalRow) {
            totalRow.textContent = `Rs ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        return grandTotal;
    }

    cartItemsContainer.addEventListener('click', (e) => {
        const cart = getCart();
        const target = e.target;

        if (target.classList.contains('qty-btn')) {
            const index = parseInt(target.getAttribute('data-index'));
            const action = target.getAttribute('data-action');

            if (action === 'increase') {
                cart[index].quantity += 1;
            } else if (action === 'decrease') {
                cart[index].quantity -= 1;
                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                }
            }
            saveCart(cart);
            renderCart();
        }

        if (target.classList.contains('remove-btn')) {
            const index = parseInt(target.getAttribute('data-index'));
            const removed = cart.splice(index, 1)[0];
            saveCart(cart);
            renderCart();
            showToast(`Removed ${removed.title} from cart.`);
        }
    });

    const promoBtn = document.querySelector('.promo-box button');
    const promoInput = document.querySelector('.promo-box input');
    if (promoBtn && promoInput) {
        promoBtn.addEventListener('click', () => {
            const code = promoInput.value.trim().toUpperCase();
            if (typeof PROMO_CODES !== 'undefined' && PROMO_CODES[code]) {
                appliedDiscount = PROMO_CODES[code];
                showToast(`Promo code applied! ${appliedDiscount * 100}% off.`);
                renderCart();
            } else {
                showToast('Invalid promo code. Try VOLTX15', 'error');
            }
        });
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                showToast('Your cart is empty!', 'error');
                return;
            }

            const currentUser = getCurrentUser();
            if (!currentUser) {
                window.location.href = './signin.html?msg=YOU%20SHOULD%20SIGNIN%20BEFORE%20CHECKOUT';
                return;
            }

            openPaymentModal();
        });
    }

    renderCart();
}

function openPaymentModal() {
    let overlay = document.getElementById('paymentModalOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'paymentModalOverlay';
        overlay.className = 'payment-modal-overlay';
        overlay.innerHTML = `
            <div class="payment-modal">
                <div class="payment-header">
                    <h2>Checkout Payment</h2>
                    <button class="close-modal-btn" id="closePaymentModal">&times;</button>
                </div>
                <div class="payment-summary">
                    <span>Amount Payable</span>
                    <span id="modalPayableAmount">Rs 0.00</span>
                </div>
                <div class="payment-methods">
                    <div class="payment-method-card active" data-method="card">Credit Card</div>
                    <div class="payment-method-card" data-method="card">Debit Card</div>
                    <div class="payment-method-card" data-method="upi">UPI / NetBank</div>
                </div>
                <form id="paymentForm">
                    <div id="paymentFields">
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label>Cardholder Name</label>
                            <input type="text" id="payName" placeholder="Name on card" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border); background:var(--surface-raised); color:var(--text);">
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label>Card Number</label>
                            <input type="text" id="payCard" maxlength="16" placeholder="1234 5678 9101 1121" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border); background:var(--surface-raised); color:var(--text);">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Expiry Date</label>
                                <input type="text" id="payExp" placeholder="MM/YY" maxlength="5" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border); background:var(--surface-raised); color:var(--text);">
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="password" id="payCvv" placeholder="123" maxlength="4" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border); background:var(--surface-raised); color:var(--text);">
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="pay-now-btn">Pay & Complete Order &rarr;</button>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('closePaymentModal').addEventListener('click', closePaymentModal);
        
        const methodCards = overlay.querySelectorAll('.payment-method-card');
        const fieldsContainer = overlay.querySelector('#paymentFields');

        methodCards.forEach(card => {
            card.addEventListener('click', () => {
                methodCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                const method = card.getAttribute('data-method');
                if (method === 'upi') {
                    fieldsContainer.innerHTML = `
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label>UPI ID / VPA</label>
                            <input type="text" id="payUpi" placeholder="username@upi" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border); background:var(--surface-raised); color:var(--text);">
                        </div>
                    `;
                } else {
                    fieldsContainer.innerHTML = `
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label>Cardholder Name</label>
                            <input type="text" id="payName" placeholder="Name on card" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border); background:var(--surface-raised); color:var(--text);">
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label>Card Number</label>
                            <input type="text" id="payCard" maxlength="16" placeholder="1234 5678 9101 1121" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border); background:var(--surface-raised); color:var(--text);">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Expiry Date</label>
                                <input type="text" id="payExp" placeholder="MM/YY" maxlength="5" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border); background:var(--surface-raised); color:var(--text);">
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="password" id="payCvv" placeholder="123" maxlength="4" required style="width:100%; padding:0.75rem; border-radius:8px; border:1px solid var(--border); background:var(--surface-raised); color:var(--text);">
                            </div>
                        </div>
                    `;
                }
            });
        });

        // Form submission handled asynchronously with a Promise
        document.getElementById('paymentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = e.target.querySelector('.pay-now-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing Payment...';

            const paymentData = {
                amount: document.getElementById('modalPayableAmount').textContent,
                timestamp: new Date().toISOString()
            };

            try {
                // Await resolution of the Promise
                const response = await processPaymentApi(paymentData);
                
                saveCart([]);
                closePaymentModal();
                if (typeof initCartPage === 'function') initCartPage();
                showToast(`Payment Successful! Transaction ID: ${response.transactionId}`);
            } catch (error) {
                // Catch rejection of the Promise
                showToast(error.message || 'Payment failed. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Pay & Complete Order →';
            }
        });
    }

    const totalEl = document.querySelector('.total-row span:last-child');
    if (totalEl) {
        document.getElementById('modalPayableAmount').textContent = totalEl.textContent;
    }

    requestAnimationFrame(() => overlay.classList.add('open'));
}

function closePaymentModal() {
    const overlay = document.getElementById('paymentModalOverlay');
    if (overlay) {
        overlay.classList.remove('open');
    }
}

function initSignupPage() {
    const signupForm = document.querySelector('form.auth-form');
    if (!signupForm || !document.getElementById('fullname')) return;

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password') ? document.getElementById('confirm-password').value : password;

        if (password !== confirmPassword) {
            showToast('Passwords do not match!', 'error');
            return;
        }

        let users = getUsers();
        if (users.find(u => u.email === email)) {
            showToast('User with this email already exists!', 'error');
            return;
        }

        const newUser = { id: Date.now(), fullname, email, password };
        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);

        showToast('Account created successfully! Redirecting...');
        setTimeout(() => {
            window.location.href = './cart.html';
        }, 1200);
    });
}

function initSigninPage() {
    if (!window.location.pathname.includes('signin.html')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const msg = urlParams.get('msg');
    
    if (msg) {
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            let alertBox = document.getElementById('checkout-alert');
            if (!alertBox) {
                alertBox = document.createElement('div');
                alertBox.id = 'checkout-alert';
                alertBox.style.cssText = `
                    background: rgba(255, 107, 26, 0.15);
                    border: 1px solid var(--orange, #ff6b1a);
                    color: var(--orange, #ff6b1a);
                    padding: 12px 16px;
                    border-radius: var(--radius, 8px);
                    font-family: var(--font-display, sans-serif);
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-align: center;
                    margin-bottom: 1.5rem;
                    letter-spacing: 0.04em;
                    box-shadow: 0 4px 12px rgba(255, 107, 26, 0.2);
                `;
                alertBox.textContent = msg;
                const header = authCard.querySelector('.auth-card-header');
                if (header) {
                    header.after(alertBox);
                } else {
                    authCard.prepend(alertBox);
                }
            }
        }
        showToast(msg, 'error');
    }

    const form = document.querySelector('.auth-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            showToast('Invalid email or password', 'error');
            return;
        }

        setCurrentUser(user);
        showToast(`Welcome back, ${user.fullname}!`);
        setTimeout(() => {
            window.location.href = './cart.html';
        }, 1200);
    });
}

function initLogoutPage() {
    if (!window.location.pathname.includes('logout.html')) return;

    const confirmYesBtn = document.querySelector('.yes-btn');
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setCurrentUser(null);
            localStorage.setItem('voltx_just_logged_out', 'true');
            window.location.href = './index.html#logout-success';
        });
    }
}
