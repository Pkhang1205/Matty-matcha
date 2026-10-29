let cart = []; 

// Giỏ hàng 
const cartBtn = document.querySelector('#cart-btn');
const cartContainer = document.querySelector('#cart-container');
const closeCartBtn = document.querySelector('#close-cart');
const cartItemsContainer = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
// Đóng/mở giỏ hàng
cartBtn.addEventListener('click', function() {
    cartContainer.classList.remove('hidden');
});
closeCartBtn.addEventListener('click', function() {
    cartContainer.classList.add('hidden');
});

// Thêm sản phẩm vào giỏ hàng 
const addCartButtons = document.querySelectorAll('.add-cart');
addCartButtons.forEach(function (button) {
    button.addEventListener('click', function() {
        const product = button.closest('.product');
        const productName = product.querySelector('h3').textContent;
        const productPrice = Number(product.querySelector(".price").textContent);
        cart.push ({
            name: productName, 
            price: productPrice
        }); 
        cartCount.textContent = cart.length

       
    });
});
// PHẦN NÀY KHÔNG HIỆN THÔNG TIN TRONG GIỎ HÀNG
if (cart.length === 0){
     cartItemsContainer.innerHTML = "<p>Giỏ hàng đang trống.</p>";
} 
else {
    let html = '';
    cart.forEach(function(item) {
        html += `<p>${item.name} - ${item.price.toLocaleString('vi-VN')}đ</p>`;
    });
    cartItemsContainer.innerHTML = html;
} 