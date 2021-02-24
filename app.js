// assign HTML DOM elements
const collectionContainer = document.querySelector('.collection-container');
const cartContainer = document.querySelector('.cart-container');
const itemsTotal = document.querySelector('#item-total');
const cartTotal = document.querySelector('#cart-total');
const clearCartBtn = document.querySelector('.clear-cart');
const openCart = document.querySelector('.cart-icon-container');
const closeCart = document.querySelector('.fa-window-close');
const cartOverlay = document.querySelector('.cart-overlay');

// initialize cart and buttonArray
let cart = [];
let buttonArray = [];

// Product class 
class Products {
  // getProducts method to fetch API
  async getProducts() {
    const API = `https://fakestoreapi.com/products`
    // try fetch 
    try {
      const response = await fetch(API);
      // convert response into json
      const data = await response.json();
      return data;
    // and catch errors
    } catch (error) {
      console.log(error)
    }
  }
}

// UI class
class UI {
  // display products method with 1 obj as arguments
  displayProducts(obj) {
    // deconstruct each obj and assign id, image, price and title
    obj.forEach( ({ id, image, price, title }) => {
      // create new product
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
        // insert new product in collection container
        collectionContainer.insertAdjacentHTML('beforeend', newProduct);
    }); 
  }
  // get buttons method
  getButtons() {
    // create and array of buttons from dynamically created products
    const buttons = [...document.querySelectorAll('.add-to-cart-btn')];
    // assign buttons to an array
    buttonArray = buttons;
    // loop through each buttons
    buttons.forEach( (button) => {
      // assign button id based on dataset id
      const id = button.dataset.id;
      // use button id to check cart if item with the same id exist
      const inCart = cart.find( (item) => item.id == id);
      
      if (inCart) {
        // change button text
        button.textContent = 'IN CART';
        // disable button function
        button.disabled = true;
        // change background color
        button.style.background = 'rgba(0, 255, 0, 0.1)';
      }
      // add click event listener to each button 
      button.addEventListener('click', (e) => {
        // prevent button default
        e.preventDefault();
        // change target button text
        e.target.textContent = 'IN CART'
        // disable target button function
        e.target.disabled = true;
        // change target button background
        e.target.style.background = 'rgba(0, 255, 0, 0.1)';
        // change target button border
        e.target.style.border = 'none';

        // get item from localStorage and add amount key with initial value of 1
        const cartItem = {...Storage.getProducts(id), amount: 1};
        // add item to cart
        cart = [...cart, cartItem]
        // save new cart values into local storage
        Storage.saveCart(cart);
        // call setItemValues to change cart total and number of items
        this.setItemValues(cart);
        // call addToCart to display item in cart into the page
        this.addToCart(cartItem);
      });
    })
  }
  // setItemValues method to change cart total amount and number of items
  setItemValues(cart) {
    // initialize priceTotal and itemTotal
    let priceTotal = 0;
    let itemTotal = 0;
    // loop thru cart array 
    cart.map( (item) => {
      // assign price total and item total
      priceTotal += item.price * item.amount;
      itemTotal += item.amount;
    })
    // change items total HTML element text content
    itemsTotal.textContent = itemTotal;
    // change item total HTML element color
    itemsTotal.style.color = '#f1c40f';
    // change cart total HTML element value
    cartTotal.textContent = parseFloat(priceTotal.toFixed(2));
  }
  // addToCart method
  // deconstruct obj parameter
  addToCart( {image, title, price, amount, id} ) {
    // create new template for added to cart product
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
    // insert added to cart product to cart container
    cartContainer.insertAdjacentHTML('beforeend', newProduct);
  }
  // setUp method 
  setUp() {
    // assign local storage cart into cart array
    cart = Storage.getCart();
    // update price total and item total based on new cart values
    this.setItemValues(cart);
    // populate cart will add cart items into the cart container
    this.populate(cart);
    
    // add click event listener to cart icon
    openCart.addEventListener('click', this.toggle);
    // add click event listener to close icon
    closeCart.addEventListener('click', this.toggle)
  }
  // toggle method to toggle cart active class
  toggle() {
    cartOverlay.classList.toggle('cart-overlay-active');
  }
  // populate method to loop thru cart array and add items into cart
  populate(cart) {
    cart.forEach( (item) => this.addToCart(item));
  }
  // cart logic method to handle cart overlay buttons
  cartLogic() {
    // add event listener to clear cart button
    clearCartBtn.addEventListener('click', () => {
      // clear cart method
      this.clearCart();
      // toggle method
      this.toggle();
    });
    // cart functionality
    cartContainer.addEventListener('click', (e) => {
      // assign click target
      const target = e.target;
      // assign click target id
      const targetId = parseInt(e.target.dataset.id, 10);
      // check if target has increase class
      if (target.classList.contains('increase')) {
        // assign item based on target id
        let tempItem = cart.find( (item) => item.id === targetId);
        // increase item amount
        tempItem.amount++;
        // save new cart to storage
        Storage.saveCart(cart);
        // change item total and price total
        this.setItemValues(cart);
        // change amount text content of item in cart
        target.nextElementSibling.textContent = tempItem.amount;
      // check if target has decrease class
      } else if (target.classList.contains('decrease')) {
        // assign item based on target id
        let tempItem = cart.find( (item) => item.id === targetId);
        // decrease item amount
        tempItem.amount--;
        // check if item amount is > 0
        if (tempItem.amount > 0) {
          // update cart local storage
          Storage.saveCart(cart);
          // change item total and price total
          this.setItemValues(cart);
          // change amount text content of item in cart
          target.previousElementSibling.textContent = tempItem.amount;
        // if item amount is equal to 0
        } else {
          // remove item from cart
          this.removeItem(targetId);
          // remove item element in cart
          cartContainer.removeChild(target.parentElement.parentElement)
        }
      }
    });
  }
  // clear cart method
  clearCart() {
    // create new array from cart array 
    const cartItems = cart.map(item => item.id);
    // loop to new array and each id call removeItem method
    cartItems.forEach( (id) => this.removeItem(id));

    // remove first child element while cart container has children
    while (cartContainer.children.length > 0) {
      cartContainer.removeChild(cartContainer.childNodes[0]);
    }
  }
  // removeItem method
  removeItem(id) {
    // create new cart array that will have items not equal to id of parameter
    cart = cart.filter( (item) => item.id !== id);
    // change item total and price total
    this.setItemValues(cart);
    // update local storage with new cart values
    Storage.saveCart(cart);

    // search for button based on id, call searchButton method
    let button = this.searchButton(id);

    // disable button
    button.disabled = false;
    // change button style
    button.style.border = '1px solid rgba(0, 0, 0, 0.1)';
    button.style.background = '#f5f5f5';
    // change button text
    button.textContent = 'ADD TO CART'
  }
  // search button method will find the button based on id from buttonArray
  searchButton(id) {
    return buttonArray.find( (button) => parseInt(button.dataset.id) === id);
  }
}

// local storage class
class Storage {
  // static saveProducts method accepts obj parameter
  static saveProducts(obj) {
    localStorage.setItem('products', JSON.stringify(obj));
  }
  // static getProducts method accepts id as parameter
  static getProducts(id) {
    // parse local storage for products
    const products = JSON.parse(localStorage.getItem('products'));
    // return product with the same id
    return products.find( (product) => product.id === parseInt(id));
  }
  // static saveCart method accept cart parameter
  static saveCart(cart) {
    // save cart as text
    localStorage.setItem('carts', JSON.stringify(cart));
  }
  // static getCart method
  static getCart() {
    // parse local storage cart if available if not return an empty array
    return localStorage.getItem('carts') ? JSON.parse(localStorage.getItem('carts')) : [];
  }
}

// add document DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => {
  // create ui instance
  const ui = new UI();
  // create product instance
  const productList = new Products();
  // assign products 
  const products = await productList.getProducts();
  
  // call ui setup method
  ui.setUp();
  // call ui display products method
  ui.displayProducts(products);
  // call ui get buttons method
  ui.getButtons();
  // call ui cart login method
  ui.cartLogic();
  // store products in local storage
  Storage.saveProducts(products);
});



