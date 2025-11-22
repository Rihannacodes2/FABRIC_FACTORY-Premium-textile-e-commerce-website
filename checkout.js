document.addEventListener('DOMContentLoaded', function() {
    const checkoutItems = document.getElementById('checkoutItems');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const shippingAmount = document.getElementById('shippingAmount');
    const taxAmount = document.getElementById('taxAmount');
    const grandTotal = document.getElementById('grandTotal');
    const checkoutForm = document.getElementById('checkoutForm');
    const confirmationModal = document.getElementById('confirmationModal');
    const invoiceDetails = document.getElementById('invoiceDetails');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    let cart = JSON.parse(localStorage.getItem('fabricFactoryCheckout')) || 
               JSON.parse(localStorage.getItem('checkoutCart')) || 
               JSON.parse(localStorage.getItem('fabricCart')) || [];

    if (cart.length === 0) {
        const fabricCart = JSON.parse(localStorage.getItem('fabricCart') || '[]');
        if (fabricCart.length > 0) {
            cart = fabricCart.map(item => {
                return {
                    ...item,
                    total: (item.price * item.yards).toFixed(2)
                };
            });
            localStorage.setItem('fabricFactoryCheckout', JSON.stringify(cart));
        }
    }

    cart = cart.map(item => {
        if (!item.total) {
            item.total = (parseFloat(item.price) * parseInt(item.yards)).toFixed(2);
        }
        return item;
    });

    let orderData = {};

    function initializeCheckout() {
        console.log('Cart data:', cart);
        
        if (cart.length === 0) {
            showEmptyCartMessage();
            return;
        }
        
        renderCheckoutItems();
        calculateTotals();
        setupPaymentMethodToggle();
        setupFormValidation();
    }

    function showEmptyCartMessage() {
        checkoutItems.innerHTML = `
            <div class="empty-cart-message">
                <div style="text-align:center; padding:40px 20px; color:#888;">
                    <div style="font-size:3rem; margin-bottom:10px;">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Add some beautiful fabrics before checking out!</p>
                    <button class="main-btn" onclick="location.href='index.html'" style="margin-top:20px;">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;
        
        checkoutForm.querySelectorAll('input, button').forEach(element => {
            element.disabled = true;
        });
        placeOrderBtn.textContent = 'Cart Empty';
        placeOrderBtn.disabled = true;
    }

    function renderCheckoutItems() {
        checkoutItems.innerHTML = '';
        
        cart.forEach((item, index) => {
            const itemTotal = item.total || (parseFloat(item.price) * parseInt(item.yards)).toFixed(2);
            
            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="checkout-item-image" onerror="this.src='CRESTLOGO.png'">
                <div class="checkout-item-details">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-meta">
                        ${item.yards} yards • ${item.color}<br>
                        ${getFinishText(item.finish)} • ${getSheenText(item.sheen)}
                    </div>
                </div>
                <div class="checkout-item-price">$${itemTotal}</div>
            `;
            checkoutItems.appendChild(itemElement);
        });
    }

    function getFinishText(finishValue) {
        const finishes = {
            '0': 'Plain',
            '2': 'Brushed',
            '3': 'Printed', 
            '5': 'Embroidered'
        };
        return finishes[finishValue] || finishValue;
    }

    function getSheenText(sheenValue) {
        const sheens = {
            '0': 'Matte',
            '1': 'Satin',
            '2': 'Gloss'
        };
        return sheens[sheenValue] || sheenValue;
    }

    function calculateTotals() {
        const subtotal = cart.reduce((sum, item) => {
            const itemTotal = parseFloat(item.total) || (parseFloat(item.price) * parseInt(item.yards));
            return sum + itemTotal;
        }, 0);
        
        const shipping = 8.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
        shippingAmount.textContent = `$${shipping.toFixed(2)}`;
        taxAmount.textContent = `$${tax.toFixed(2)}`;
        grandTotal.textContent = `$${total.toFixed(2)}`;

        orderData = {
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
            items: [...cart],
            orderNumber: generateOrderNumber(),
            orderDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
    }

    function generateOrderNumber() {
        return 'FF' + Date.now() + Math.floor(Math.random() * 1000);
    }

    function setupPaymentMethodToggle() {
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        const creditCardForm = document.getElementById('creditCardForm');

        paymentMethods.forEach(method => {
            method.addEventListener('change', function() {
                if (this.value === 'credit') {
                    creditCardForm.style.display = 'block';
                } else {
                    creditCardForm.style.display = 'none';
                }
            });
        });
    }

    function setupFormValidation() {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                processOrder();
            }
        });
    }

    function validateForm() {
        const requiredFields = checkoutForm.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ff4444';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        const creditCardSelected = document.getElementById('creditCard').checked;
        if (creditCardSelected) {
            const cardNumber = document.getElementById('cardNumber').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;
            const cardName = document.getElementById('cardName').value;

            if (!cardNumber || !expiryDate || !cvv || !cardName) {
                showNotification('Please fill in all credit card details', 'error');
                isValid = false;
            }
        }

        if (!isValid) {
            showNotification('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    function processOrder() {
        placeOrderBtn.textContent = 'Processing...';
        placeOrderBtn.disabled = true;

        setTimeout(() => {
            const formData = new FormData(checkoutForm);
            orderData.customer = {
                name: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
                paymentMethod: formData.get('paymentMethod')
            };

            saveOrderToStorage();
            showConfirmationModal();

            localStorage.removeItem('fabricFactoryCart');
            localStorage.removeItem('fabricFactoryCheckout');
            localStorage.removeItem('checkoutCart');
            localStorage.removeItem('fabricCart');

            placeOrderBtn.textContent = 'Place Order';
            placeOrderBtn.disabled = false;
        }, 2000);
    }

    function saveOrderToStorage() {
        const orders = JSON.parse(localStorage.getItem('fabricFactoryOrders')) || [];
        orders.push(orderData);
        localStorage.setItem('fabricFactoryOrders', JSON.stringify(orders));
        
        localStorage.setItem('fabricFactoryLatestOrder', JSON.stringify(orderData));
    }

    function showConfirmationModal() {
        renderInvoiceDetails();
        confirmationModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function renderInvoiceDetails() {
        invoiceDetails.innerHTML = '';
        
        const orderInfo = document.createElement('div');
        orderInfo.className = 'invoice-item';
        orderInfo.innerHTML = `
            <span>Order Number:</span>
            <span>${orderData.orderNumber}</span>
        `;
        invoiceDetails.appendChild(orderInfo);

        const orderDate = document.createElement('div');
        orderDate.className = 'invoice-item';
        orderDate.innerHTML = `
            <span>Order Date:</span>
            <span>${orderData.orderDate}</span>
        `;
        invoiceDetails.appendChild(orderDate);

        const customerName = document.createElement('div');
        customerName.className = 'invoice-item';
        customerName.innerHTML = `
            <span>Customer:</span>
            <span>${orderData.customer.name}</span>
        `;
        invoiceDetails.appendChild(customerName);

        const customerEmail = document.createElement('div');
        customerEmail.className = 'invoice-item';
        customerEmail.innerHTML = `
            <span>Email:</span>
            <span>${orderData.customer.email}</span>
        `;
        invoiceDetails.appendChild(customerEmail);

        const shippingAddress = document.createElement('div');
        shippingAddress.className = 'invoice-item';
        shippingAddress.innerHTML = `
            <span>Shipping Address:</span>
            <span>${orderData.customer.address}, ${orderData.customer.city}, ${orderData.customer.state} ${orderData.customer.zipCode}</span>
        `;
        invoiceDetails.appendChild(shippingAddress);


        orderData.items.forEach(item => {
            const itemTotal = item.total || (parseFloat(item.price) * parseInt(item.yards)).toFixed(2);
            const itemElement = document.createElement('div');
            itemElement.className = 'invoice-item';
            itemElement.innerHTML = `
                <span>${item.name} (${item.yards}yd, ${item.color})</span>
                <span>$${itemTotal}</span>
            `;
            invoiceDetails.appendChild(itemElement);
        });

        const subtotal = document.createElement('div');
        subtotal.className = 'invoice-item';
        subtotal.innerHTML = `
            <span>Subtotal:</span>
            <span>$${orderData.subtotal}</span>
        `;
        invoiceDetails.appendChild(subtotal);

        const shipping = document.createElement('div');
        shipping.className = 'invoice-item';
        shipping.innerHTML = `
            <span>Shipping:</span>
            <span>$${orderData.shipping}</span>
        `;
        invoiceDetails.appendChild(shipping);

        const tax = document.createElement('div');
        tax.className = 'invoice-item';
        tax.innerHTML = `
            <span>Tax:</span>
            <span>$${orderData.tax}</span>
        `;
        invoiceDetails.appendChild(tax);

        const total = document.createElement('div');
        total.className = 'invoice-item';
        total.style.fontWeight = 'bold';
        total.style.borderTop = '2px solid #e6c875';
        total.style.paddingTop = '10px';
        total.style.marginTop = '10px';
        total.innerHTML = `
            <span>Total:</span>
            <span>$${orderData.total}</span>
        `;
        invoiceDetails.appendChild(total);
    }

    function showNotification(message, type = 'success') {
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
        
        setTimeout(() => {
            notif.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notif.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notif.parentNode) notif.parentNode.removeChild(notif);
            }, 300);
        }, 3000);
    }

    initializeCheckout();
});

function printInvoice() {
    window.print();
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById('confirmationModal');
    if (e.target === modal) {
        closeConfirmationModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeConfirmationModal();
    }
});