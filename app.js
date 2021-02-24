const collectionContainer = document.querySelector('.collection-container');
const cartContainer = document.querySelector('.cart-container');
const itemsTotal = document.querySelector('#item-total');
const cartTotal = document.querySelector('#cart-total');
const clearCartBtn = document.querySelector('.clear-cart');
const openCart = document.querySelector('.cart-icon-container');
const closeCart = document.querySelector('.fa-window-close');
const cartOverlay = document.querySelector('.cart-overlay');

let cart = [];
let buttonArray = [];

// get the products
class Products {
  async getProducts() {
    const API = `https://fakestoreapi.com/products`
    try {
      const response = await fetch(API);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error)
    }
  }
}

// display products
class UI {
  displayProducts(obj) {
    const collectionContainer = document.querySelector('.collection-container');
    obj.forEach( ({ id, image, price, title }) => {
      const newProduct = 
        `
          <div class="product-container">
				    <div class="img-container">
					    <img src="${image}" alt="${title}">
				    </div>
				    <p>${title}</p>
				    <p>$${price}</p>
				    <button class="add-to-cart-btn" data-id=${id}>ADD TO CART</button>
			    </div>
        `
        collectionContainer.insertAdjacentHTML('beforeend', newProduct);
    }); 
  }
  getButtons() {
    const buttons = [...document.querySelectorAll('.add-to-cart-btn')];
    buttonArray = buttons;
    buttons.forEach( (button) => {
      const id = button.dataset.id;
      const inCart = cart.find( (item) => item.id == id);
      
      if (inCart) {
        button.textContent = 'IN CART';
        button.disabled = true;
        button.style.background = 'rgba(0, 255, 0, 0.1)';
      }

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.target.textContent = 'IN CART'
        e.target.disabled = true;
        e.target.style.background = 'rgba(0, 255, 0, 0.1)';
        e.target.style.border = 'none';

        // get product from local storage products
        const cartItem = {...Storage.getProducts(id), amount: 1};
        // add product to cart
        cart = [...cart, cartItem]
        // store product in local storage
        Storage.saveCart(cart);
        // set item values
        this.setItemValues(cart);
        // display cart
        this.addToCart(cartItem);
      });
    })
  }
  setItemValues(cart) {
    let tempTotal = 0;
    let itemTotal = 0;
    cart.map( (item) => {
      tempTotal += item.price * item.amount;
      itemTotal += item.amount;
    })
    itemsTotal.textContent = itemTotal;
    itemsTotal.style.color = '#f1c40f';
    cartTotal.textContent = parseFloat(tempTotal.toFixed(2));
  }
  addToCart( {image, title, price, amount, id} ) {
    let newProduct = 
    `
    <div class="cart-item">
			<div class="cart-item-img">
				<img src="${image}" alt="${title}">
			</div>
			<div class="cart-item-info">
				<p>${title}</p>
				<p>$${price}</p>
			</div>
			<div class="cart-item-amount">
				<i class="fas fa-chevron-up increase" data-id=${id}></i>
				<p>${amount}</p>
				<i class="fas fa-chevron-down decrease" data-id=${id}></i>
			</div>
		</div>
    `
    cartContainer.insertAdjacentHTML('beforeend', newProduct);
  }
  setUp() {
    cart = Storage.getCart();
    this.setItemValues(cart);
    this.populate(cart);
    
    openCart.addEventListener('click', this.toggle);
    closeCart.addEventListener('click', this.toggle)
  }
  toggle() {
    cartOverlay.classList.toggle('cart-overlay-active');
  }
  populate(cart) {
    cart.forEach( (item) => this.addToCart(item));
  }
  cartLogic() {
    // clear cart
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
      this.toggle();
    });
    //cart functionality
    cartContainer.addEventListener('click', (e) => {
      const target = e.target;
      const targetId = parseInt(e.target.dataset.id, 10);

      if (target.classList.contains('increase')) {
        let tempItem = cart.find( (item) => item.id === targetId);
        tempItem.amount++;
        Storage.saveCart(cart);
        this.setItemValues(cart);
        target.nextElementSibling.textContent = tempItem.amount;
      } else if (target.classList.contains('decrease')) {
        let tempItem = cart.find( (item) => item.id === targetId);
        tempItem.amount--;

        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setItemValues(cart);
          target.previousElementSibling.textContent = tempItem.amount;
        } else {
          this.removeItem(targetId);
          cartContainer.removeChild(target.parentElement.parentElement)
        }
      }
    });
  }
  clearCart() {
    const cartItems = cart.map(item => item.id);
    cartItems.forEach( (id) => this.removeItem(id));

    while (cartContainer.children.length > 0) {
      cartContainer.removeChild(cartContainer.childNodes[0]);
    }
  }
  removeItem(id) {
    cart = cart.filter( (item) => item.id !== id);
    this.setItemValues(cart);
    Storage.saveCart(cart);

    let button = this.singleButton(id);
    button.disabled = false;
    button.style.border = '1px solid rgba(0, 0, 0, 0.1)';
    button.style.background = '#f5f5f5';
    button.textContent = 'ADD TO CART'
  }
  singleButton(id) {
    return buttonArray.find( (button) => parseInt(button.dataset.id) === id);
  }
}

// local storage
class Storage {
  static saveProducts(obj) {
    localStorage.setItem('products', JSON.stringify(obj));
  }
  static getProducts(id) {
    const products = JSON.parse(localStorage.getItem('products'));
    return products.find( (product) => product.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem('carts', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('carts') ? JSON.parse(localStorage.getItem('carts')) : [];
  }
}

// add document DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => {
  const ui = new UI();
  const productList = new Products();
  const products = await productList.getProducts();
  
  ui.setUp();
  ui.displayProducts(products);
  Storage.saveProducts(products);
  ui.getButtons();
  ui.cartLogic();
});



