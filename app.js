// Add to cart
import { formatPrice, getElement } from '../utils.js'
const cartItemsDOM = getElement('.cart-items')
const addToCartDOM = ({ id, name, price, image, amount }) => {
	const article = document.createElement('article')
	article.classList.add('cart-item')
	article.setAttribute('data-id', id)
	article.innerHTML = `
    <img src="${image}"
              class="cart-item-img"
              alt="${name}"
            />
            <div>
              <h4 class="cart-item-name">${name}</h4>
              <p class="cart-item-price">${formatPrice(price)}</p>
              <button class="cart-item-remove-btn" data-id="${id}">remove</button>
            </div>

            <div>
              <button class="cart-item-increase-btn" data-id="${id}">
                <i class="fas fa-chevron-up"></i>
              </button>
              <p class="cart-item-amount" data-id="${id}">${amount}</p>
              <button class="cart-item-decrease-btn" data-id="${id}">
                <i class="fas fa-chevron-down"></i>
              </button>
            </div>
  `
	cartItemsDOM.appendChild(article)
}

export default addToCartDOM

// Setup cart
// import
import { getStorageItem, setStorageItem, formatPrice, getElement } from '../utils.js'
import { openCart } from './toggleCart.js'
import { findProduct } from '../store.js'
import addToCartDOM from './addToCartDOM.js'
// set items

const cartItemCountDOM = getElement('.cart-item-count')
const cartItemsDOM = getElement('.cart-items')
const cartTotalDOM = getElement('.cart-total')

let cart = getStorageItem('cart')

export const addToCart = id => {
	let item = cart.find(cartItem => cartItem.id === id)

	if (!item) {
		let product = findProduct(id)
		// add item to the the
		product = { ...product, amount: 1 }
		cart = [...cart, product]
		// add item to the DOM;
		addToCartDOM(product)
	} else {
		// update values
		const amount = increaseAmount(id)
		const items = [...cartItemsDOM.querySelectorAll('.cart-item-amount')]
		const newAmount = items.find(value => value.dataset.id === id)
		newAmount.textContent = amount
	}
	// add one to the item count
	displayCartItemCount()
	// display cart totals
	displayCartTotal()
	// set cart in local storage

	setStorageItem('cart', cart)
	//more stuff coming up
	openCart()
}
function displayCartItemCount() {
	const amount = cart.reduce((total, cartItem) => {
		return (total += cartItem.amount)
	}, 0)
	cartItemCountDOM.textContent = amount
}
function displayCartTotal() {
	let total = cart.reduce((total, cartItem) => {
		return (total += cartItem.price * cartItem.amount)
	}, 0)
	cartTotalDOM.textContent = `Total : ${formatPrice(total)} `
}
function displayCartItemsDOM() {
	cart.forEach(cartItem => {
		addToCartDOM(cartItem)
	})
}
function removeItem(id) {
	cart = cart.filter(cartItem => cartItem.id !== id)
}
function increaseAmount(id) {
	let newAmount
	cart = cart.map(cartItem => {
		if (cartItem.id === id) {
			newAmount = cartItem.amount + 1
			cartItem = { ...cartItem, amount: newAmount }
		}
		return cartItem
	})
	return newAmount
}
function decreaseAmount(id) {
	let newAmount
	cart = cart.map(cartItem => {
		if (cartItem.id === id) {
			newAmount = cartItem.amount - 1
			cartItem = { ...cartItem, amount: newAmount }
		}
		return cartItem
	})
	return newAmount
}

function setupCartFunctionality() {
	cartItemsDOM.addEventListener('click', function (e) {
		const element = e.target
		const parent = e.target.parentElement
		const id = e.target.dataset.id
		const parentID = e.target.parentElement.dataset.id
		// remove
		if (element.classList.contains('cart-item-remove-btn')) {
			removeItem(id)
			// parent.parentElement.remove();
			element.parentElement.parentElement.remove()
		}
		// increase
		if (parent.classList.contains('cart-item-increase-btn')) {
			const newAmount = increaseAmount(parentID)
			parent.nextElementSibling.textContent = newAmount
		}
		// decrease
		if (parent.classList.contains('cart-item-decrease-btn')) {
			const newAmount = decreaseAmount(parentID)
			if (newAmount === 0) {
				removeItem(parentID)
				parent.parentElement.parentElement.remove()
			} else {
				parent.previousElementSibling.textContent = newAmount
			}
		}
		displayCartItemCount()
		displayCartTotal()
		setStorageItem('cart', cart)
	})
}
const init = () => {
	// display amount of cart items
	displayCartItemCount()
	// display total
	displayCartTotal()
	// add all cart items to the dom
	displayCartItemsDOM()
	// setup cart functionality
	setupCartFunctionality()
}
init()

// Toggle cart
import { getElement } from '../utils.js'

const cartOverlay = getElement('.cart-overlay')
const closeCartBtn = getElement('.cart-close')
const toggleCartBtn = getElement('.toggle-cart')

toggleCartBtn.addEventListener('click', () => {
	cartOverlay.classList.add('show')
})
closeCartBtn.addEventListener('click', () => {
	cartOverlay.classList.remove('show')
})

export const openCart = () => {
	cartOverlay.classList.add('show')
}

// Display products
import { formatPrice } from './utils.js';
import { addToCart } from './cart/setupCart.js';
const display = (products, element, filters) => {
  // display products
  element.innerHTML = products
    .map((product) => {
      const { id, name, image, price } = product;
      return ` <article class="product">
          <div class="product-container">
            <img src="${image}" class="product-img img" alt="${name}" />

            <div class="product-icons">
              <a href="product.html?id=${id}" class="product-icon">
                <i class="fas fa-search"></i>
              </a>
              <button class="product-cart-btn product-icon" data-id="${id}">
                <i class="fas fa-shopping-cart"></i>
              </button>
            </div>
          </div>
          <footer>
            <p class="product-name">${name}</p>
            <h4 class="product-price">${formatPrice(price)}</h4>
          </footer>
        </article> `;
    })
    .join('');

  if (filters) return;

  element.addEventListener('click', function (e) {
    const parent = e.target.parentElement;
    if (parent.classList.contains('product-cart-btn')) {
      addToCart(parent.dataset.id);
    }
  });
};

export default display;

// Fetch products
import { allProductsUrl } from './utils.js';

const fetchProducts = async () => {
  const response = await fetch(allProductsUrl).catch((err) => console.log(err));
  if (response) {
    return response.json();
  }
  return response;
};

export default fetchProducts;

// Store
import { getStorageItem, setStorageItem } from './utils.js';
let store = getStorageItem('store');
const setupStore = (products) => {
  store = products.map((product) => {
    const {
      id,
      fields: { featured, name, price, company, colors, image: img },
    } = product;
    const image = img[0].thumbnails.large.url;
    return { id, featured, name, price, company, colors, image };
  });
  setStorageItem('store', store);
};

const findProduct = (id) => {
  let product = store.find((product) => product.id === id);
  return product;
};

export { store, setupStore, findProduct };

// Toggle sidebar
import { getElement } from './utils.js';

const toggleNav = getElement('.toggle-nav');
const sidebarOverlay = getElement('.sidebar-overlay');
const closeBtn = getElement('.sidebar-close');

toggleNav.addEventListener('click', () => {
  sidebarOverlay.classList.add('show');
});
closeBtn.addEventListener('click', () => {
  sidebarOverlay.classList.remove('show');
});

// Utils
//   ATTENTION!!!!!!!!!!!
//   I SWITCHED TO PERMANENT DOMAIN
//   DATA IS THE SAME JUST A DIFFERENT URL,
//   DOES NOT AFFECT PROJECT FUNCTIONALITY

const allProductsUrl = 'https://course-api.com/javascript-store-products';
// temporary single product
// 'https://course-api.com/javascript-store-single-product?id=rec43w3ipXvP28vog'
const singleProductUrl =
  'https://course-api.com/javascript-store-single-product';

const getElement = (selection) => {
  const element = document.querySelector(selection);
  if (element) return element;

  // throw new Error(`Please check "${selection}" selector, no such element exist`)
};

const formatPrice = (price) => {
  let formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format((price / 100).toFixed(2));
  return formattedPrice;
};

const getStorageItem = (item) => {
  let storageItem = localStorage.getItem(item);
  if (storageItem) {
    storageItem = JSON.parse(localStorage.getItem(item));
  } else {
    storageItem = [];
  }
  return storageItem;
};

const setStorageItem = (name, item) => {
  localStorage.setItem(name, JSON.stringify(item));
};

export {
  allProductsUrl,
  singleProductUrl,
  getElement,
  formatPrice,
  getStorageItem,
  setStorageItem,
};


// Index
// global imports
import './src/toggleSidebar.js';
import './src/cart/toggleCart.js';
import './src/cart/setupCart.js';
// specific imports
import fetchProducts from './src/fetchProducts.js';
import { setupStore, store } from './src/store.js';
import display from './src/displayProducts.js';
import { getElement } from './src/utils.js';

const init = async () => {
  const products = await fetchProducts();
  if (products) {
    // add products to the store
    setupStore(products);
    const featured = store.filter((product) => product.featured === true);
    display(featured, getElement('.featured-center'));
  }
};

window.addEventListener('DOMContentLoaded', init);
