let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
const productsContainer = document.querySelector('#products');

// Giỏ hàng 
const cartBtn = document.querySelector('#cart-btn');
const cartContainer = document.querySelector('#cart-container');
const closeCartBtn = document.querySelector('#close-cart');
const cartItemsContainer = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');

const checkoutBtn = document.querySelector('#checkout-btn');
const checkoutForm = document.querySelector('#checkout-form');
const checkoutContainer = document.querySelector('#checkout-container');

// Đóng/mở giỏ hàng
cartBtn.addEventListener('click', function() {
    cartContainer.classList.remove('hidden');
});
closeCartBtn.addEventListener('click', function() {
    cartContainer.classList.add('hidden');
});


// Thêm sản phẩm vào giỏ hàng 
productsContainer.addEventListener('click', function(event){
    if(event.target.classList.contains('add-cart')) {
        const productElement = event.target.closest('.product');
        const productID = Number(productElement.dataset.id);
        const product = products.find(function(item){
            return item.id === productID;
        });
        if(product){
            const existingProduct = cart.find(function(item) {
                return item.id === productID;
            });
            if(existingProduct) {
                existingProduct.quantity++;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
            });
        }
        cartCount.textContent = cart.reduce(function(total, item){
            return total + item.quantity;
        }, 0);
        saveCart();
        renderCart();
        }
    }
});


// Hiển thị giỏ hàng: đặt trong hàm để gọi lại mỗi khi giỏ thay đổi
function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Giỏ hàng đang trống.</p>";
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach(function(item) {
        html +=`
            <p>
                ${item.name} - ${item.price.toLocaleString('vi-VN')}đ 
                x ${item.quantity}
                <button class='decrease-cart' data-id="${item.id}">-</button>
                <button class='increase-cart' data-id="${item.id}">+</button>
                <button class="remove-cart" data-id="${item.id}">Xóa</button> 
            </p>`;
        total += item.price * item.quantity;
    });
    html += `<p><strong>Tổng: ${total.toLocaleString('vi-VN')}đ</strong></p>`;
    html += `<button id="checkout-btn">Đặt hàng</button>`;
    cartItemsContainer.innerHTML = html;
}

renderCart(); // hiển thị trạng thái ban đầu
cartCount.textContent = cart.reduce(function(total, item) {
    return total + item.quantity;
}, 0);

//Lưu sản phẩm 
function saveCart(){
    localStorage.setItem('cart', JSON.stringify(cart));
}

//Xoá sản phẩm khỏi giỏ hàng
cartItemsContainer.addEventListener('click', function(event) {
    const productID = Number(event.target.dataset.id);

    // Giảm số lượng
    if (event.target.classList.contains('decrease-cart')) {
        const product = cart.find(function(item) {
            return item.id === productID;
        });

        if (product) {
            product.quantity--;

            if (product.quantity === 0) {
                cart = cart.filter(function(item) {
                    return item.id !== productID;
                });
            }
        }
    }

    // Tăng số lượng
    if(event.target.classList.contains('increase-cart')) {
        const product = cart.find(function(item){
            return item.id === productID;
        });
        if(product) {
            product.quantity++;
        }   
    }

    // Xóa toàn bộ sản phẩm
    if (event.target.classList.contains('remove-cart')) {
        cart = cart.filter(function(item) {
            return item.id !== productID;
        });
    }

    if (event.target.id === 'checkout-btn') {
        checkoutContainer.classList.remove('hidden');
        cartContainer.classList.add('hidden');
        return; // Dừng xử lý tiếp theo để không cập nhật giỏ hàng khi mở form đặt hàng 
    }
    // Cập nhật số lượng trên biểu tượng giỏ hàng
    cartCount.textContent = cart.reduce(function(total, item) {
        return total + item.quantity;
    }, 0);

    saveCart();
    renderCart();
});

// Lấy dữ liệu sản phẩm từ API và hiển thị
const productList = document.querySelector('#products');
async function loadProducts() {
    try{
        const respone = await fetch('http://127.0.0.1:8000/api/products');
        products = await respone.json();
        console.log(products);
        renderProducts(products);

    } catch (error) {  
        console.error('Lỗi khi tải sản phẩm:', error);
    }
}


// Hiển thị sản phẩm
function renderProducts(products) {
    let html = '';
    products.forEach(function(product) {
        html += `
            <article class="product" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">${product.price.toLocaleString('vi-VN')}đ</p>
                <button class="add-cart">Thêm vào giỏ</button>
            </article>
        `;
    });
    productList.innerHTML = html;
}

loadProducts();


// Xử lý đặt hàng
checkoutForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.querySelector('#name').value;
    const address = document.querySelector('#address').value;
    const phone = document.querySelector('#phone').value;

    const orderData = {
        name: name,
        address: address,
        phone: phone,
        note: note,
        cart: cart
    };
    fetch('http://127.0.0.1:8000/api/orders',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log('Đặt hàng thành công:', data);
    })
    .then(function(error) {
        console.error('Lỗi khi đặt hàng:', error);
    });
    
    items = cart.map(function(item) {
        return {
            product_id: item.id,
            quantity: item.quantity
        };
    });
    
    console.log('Thông tin đặt hàng:', orderData);

})


