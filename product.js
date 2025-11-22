document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing products page');

    try {
  
        const pageFlag = !!(document.body && document.body.dataset && document.body.dataset.page === 'product');
  
        const hasProductGrid = !!document.querySelector('.product-grid') || !!document.getElementById('productGrid');
        const pathnameMatch = typeof location.pathname === 'string' && location.pathname.endsWith('index.html');
        if (pageFlag || hasProductGrid || pathnameMatch) {
            checkLoginStatus();
        }
    } catch (e) {
        console.error('Error checking page for product guard', e);
    }
    initializeCart();
    setupEventListeners();
    
    setupHeroSlider();
});

function checkLoginStatus() {
    const user = localStorage.getItem('fabricFactoryUser');
    if (!user) {
        console.log('No user logged in, redirecting to profile...');
        showNotification('Please log in to view products', 'error');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
        return;
    }
    
    console.log('User is logged in:', JSON.parse(user));
}

function setupEventListeners() {
    const viewButtons = document.querySelectorAll('.card-action');
    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const card = e.target.closest('.product-card');
            if (card) {
                openProductModal(card);
            }
        });
    });

    const openCartBtn = document.getElementById('openCartBtn');
    if (openCartBtn) {
        openCartBtn.addEventListener('click', toggleCart);
    }

    const closeDetail = document.getElementById('closeDetail');
    const cancelDetail = document.getElementById('cancelDetail');
    const closeCart = document.getElementById('closeCart');
    
    if (closeDetail) closeDetail.addEventListener('click', closeModal);
    if (cancelDetail) cancelDetail.addEventListener('click', closeModal);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);

    const addToCartBtn = document.getElementById('addToCart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCartFromModal);
    }

    const clearCartBtn = document.getElementById('clearCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    const optYards = document.getElementById('optYards');
    const optFinish = document.getElementById('optFinish');
    const optSheen = document.getElementById('optSheen');
    
    if (optYards) optYards.addEventListener('input', updateSubtotal);
    if (optFinish) optFinish.addEventListener('change', updateSubtotal);
    if (optSheen) optSheen.addEventListener('change', updateSubtotal);
}

function setupHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    let currentSlide = 0;

    if (slides.length === 0) return;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });
    }


    showSlide(0);
}

let currentProduct = null;

function openProductModal(card) {
    console.log('Opening product modal for:', card.dataset.name);
    
    currentProduct = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        images: JSON.parse(card.dataset.images),
        description: card.dataset.description
    };


    const detailImage = document.getElementById('detailImage');
    const detailName = document.getElementById('detailName');
    const detailDesc = document.getElementById('detailDesc');
    const thumbRow = document.getElementById('thumbRow');

    if (detailImage && currentProduct.images.length > 0) {
        detailImage.src = currentProduct.images[0];
        detailImage.alt = currentProduct.name;
    }

    if (detailName) detailName.textContent = currentProduct.name;
    if (detailDesc) detailDesc.textContent = currentProduct.description;

    if (thumbRow) {
        thumbRow.innerHTML = '';
        currentProduct.images.forEach((src, index) => {
            const thumbBox = document.createElement('div');
            thumbBox.className = 'thumb-box';
            const img = document.createElement('img');
            img.src = src;
            img.alt = `${currentProduct.name} ${index + 1}`;
            thumbBox.appendChild(img);
            thumbBox.addEventListener('click', () => {
                detailImage.src = src;
    
                document.querySelectorAll('.thumb-box').forEach(box => {
                    box.style.outline = 'none';
                });
                thumbBox.style.outline = '2px solid #e6c875';
            });
            thumbRow.appendChild(thumbBox);
        });
        if (thumbRow.firstChild) {
            thumbRow.firstChild.style.outline = '2px solid #e6c875';
        }
    }

    const optYards = document.getElementById('optYards');
    const optColor = document.getElementById('optColor');
    const optFinish = document.getElementById('optFinish');
    const optSheen = document.getElementById('optSheen');
    
    if (optYards) optYards.value = '1';
    if (optColor) optColor.selectedIndex = 0;
    if (optFinish) optFinish.selectedIndex = 0;
    if (optSheen) optSheen.selectedIndex = 0;

    updateSubtotal();

    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function updateSubtotal() {
    if (!currentProduct) return;

    const yards = parseInt(document.getElementById('optYards').value) || 1;
    const finishPrice = parseInt(document.getElementById('optFinish').value) || 0;
    const sheenPrice = parseInt(document.getElementById('optSheen').value) || 0;
    
    const subtotal = (currentProduct.price * yards) + (finishPrice * yards) + (sheenPrice * yards);
    
    const subtotalElement = document.getElementById('detailSubtotal');
    if (subtotalElement) {
        subtotalElement.textContent = subtotal.toFixed(2);
    }
}

function addToCartFromModal() {
    if (!currentProduct) return;

    const yards = parseInt(document.getElementById('optYards').value) || 1;
    const color = document.getElementById('optColor').value;
    const finish = document.getElementById('optFinish').value;
    const sheen = document.getElementById('optSheen').value;

    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        yards: yards,
        color: color,
        finish: finish,
        sheen: sheen,
        image: currentProduct.images[0]
    };

    let cart = JSON.parse(localStorage.getItem('fabricCart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('fabricCart', JSON.stringify(cart));

    updateCartDisplay();
    showNotification(`${currentProduct.name} added to cart!`, 'success');
    closeModal();
}

function initializeCart() {
    let cart = localStorage.getItem('fabricCart');
    if (!cart) {
        cart = [];
        localStorage.setItem('fabricCart', JSON.stringify(cart));
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('fabricCart') || '[]');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartItems = document.getElementById('cartItems');

    if (cartCount) {
        cartCount.textContent = cart.length;
    }

    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.yards), 0);
        cartTotal.textContent = total.toFixed(2);
    }

    if (cartItems) {
        cartItems.innerHTML = '';
        if (cart.length === 0) {
            cartItems.innerHTML = '<li class="empty-cart">Your cart is empty</li>';
        } else {
            cart.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-item-info">
                        <strong>${item.name}</strong>
                        <div>${item.yards} yd • ${item.color}</div>
                    </div>
                    <div class="cart-item-actions">
                        <span>$${(item.price * item.yards).toFixed(2)}</span>
                        <button class="remove-btn" onclick="removeFromCart(${index})">✕</button>
                    </div>
                `;
                cartItems.appendChild(li);
            });
        }
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('fabricCart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('fabricCart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Item removed from cart', 'success');
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.setItem('fabricCart', JSON.stringify([]));
        updateCartDisplay();
        showNotification('Cart cleared', 'success');
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('open');
        cartSidebar.setAttribute('aria-hidden', cartSidebar.classList.contains('open') ? 'false' : 'true');
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('open');
        cartSidebar.setAttribute('aria-hidden', 'true');
    }
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('fabricCart') || '[]');
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.yards), 0);
    
  
    showNotification(`Redirecting to checkout - Total: $${total.toFixed(2)}`, 'success');
    

    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 1500);
}

function showNotification(message, type = 'success') {
    const existingNotifs = document.querySelectorAll('.notification');
    existingNotifs.forEach(notif => notif.remove());

    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => notif.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notif.style.transform = 'translateX(400px)';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.closeCartSidebar = closeCartSidebar;
window.closeModal = closeModal;
window.checkout = checkout;