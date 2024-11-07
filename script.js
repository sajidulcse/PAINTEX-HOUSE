document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('cartPopup');
    const closeBtn = document.querySelector('.popup .close-btn');
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const cartCountElement = document.querySelector('.cart-count');
    let cartItems = {};

    function addItemToCart(product) {
        if (cartItems[product.id]) {
            cartItems[product.id].quantity += product.quantity;
            updateCartItem(cartItems[product.id]);
        } else {
            cartItems[product.id] = product;
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.dataset.id = product.id;
            itemElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="item-details">
                    <h3>${product.name}</h3>
                    <p>Price: <span class="item-price">${(product.price * product.quantity).toFixed(2)}</span></p>
                    <div class="quantity-controls">
                        <button class="decrease-quantity">-</button>
                        <input type="number" class="quantity" value="${product.quantity}" min="1">
                        <button class="increase-quantity">+</button>
                    </div>
                    <button class="remove-btn">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);

            // Event listeners for quantity controls
            itemElement.querySelector('.decrease-quantity').addEventListener('click', () => {
                const quantityInput = itemElement.querySelector('.quantity');
                if (quantityInput.value > 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                    updateCartItem({ ...product, quantity: parseInt(quantityInput.value) });
                }
            });

            itemElement.querySelector('.increase-quantity').addEventListener('click', () => {
                const quantityInput = itemElement.querySelector('.quantity');
                quantityInput.value = parseInt(quantityInput.value) + 1;
                updateCartItem({ ...product, quantity: parseInt(quantityInput.value) });
            });

            itemElement.querySelector('.quantity').addEventListener('input', () => {
                const quantityInput = itemElement.querySelector('.quantity');
                if (quantityInput.value >= 1) {
                    updateCartItem({ ...product, quantity: parseInt(quantityInput.value) });
                }
            });

            itemElement.querySelector('.remove-btn').addEventListener('click', () => {
                delete cartItems[product.id];
                itemElement.remove();
                updateSubtotal();
                updateCartCount();
            });
        }

        updateSubtotal();
        updateCartCount();

        if (popup.style.display !== 'block') {
            popup.style.display = 'block';
            setTimeout(() => {
                popup.style.transform = 'translateX(0)';
            }, 10);
        }
    }

    function updateCartItem(updatedProduct) {
        cartItems[updatedProduct.id] = updatedProduct;

        const itemElement = document.querySelector(`.cart-item[data-id="${updatedProduct.id}"]`);
        itemElement.querySelector('.quantity').value = updatedProduct.quantity;

        // Send AJAX request to update price
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'update_price.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    const itemPriceElement = itemElement.querySelector('.item-price');
                    itemPriceElement.textContent = response.newPrice.toFixed(2);
                    updateSubtotal();
                } else {
                    console.error('Failed to update price:', response.error);
                }
            }
        };
        xhr.send(`productId=${updatedProduct.id}&quantity=${updatedProduct.quantity}`);
    }

    function updateSubtotal() {
        let subtotal = 0;
        document.querySelectorAll('.item-price').forEach(priceElement => {
            subtotal += parseFloat(priceElement.textContent);
        });
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }

    function updateCartCount() {
        const itemCount = Object.keys(cartItems).length;
        cartCountElement.textContent = itemCount;
    }

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const productElement = event.target.closest('.product');
            const productId = productElement.dataset.id;
            const productImage = productElement.querySelector('img').src;
            const productName = productElement.querySelector('h3').textContent;
            const productPrice = parseFloat(productElement.querySelector('.new-price').textContent.replace('$', ''));

            addItemToCart({ id: productId, image: productImage, name: productName, price: productPrice, quantity: 1 });
        });
    });

    closeBtn.addEventListener('click', () => {
        popup.style.transform = 'translateX(100%)';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
    });

    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            closeBtn.click();
        }
    });

    document.getElementById('viewCart').addEventListener('click', () => {
        alert('View Cart button clicked!');
    });

    document.getElementById('checkout').addEventListener('click', () => {
        alert('Checkout button clicked!');
    });
});
