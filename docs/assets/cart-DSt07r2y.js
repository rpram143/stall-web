import{j as u,k as p,c as g,a as w,l as f,m as h}from"./db-Ddrb56FG.js";let o=[],s=null;async function v(){if(s=await w(),!s){alert("Please login to view your cart"),window.location.href="auth.html";return}k(s),await d(),B()}function k(t){const n=document.getElementById("admin-link"),e=document.getElementById("auth-link"),a=document.getElementById("logout-link");t&&(e.style.display="none",a.style.display="block",t.is_admin&&(n.style.display="block"))}async function d(){const t=document.getElementById("cart-content"),n=document.getElementById("cart-summary");try{if(o=await g(s.id),o.length===0){t.innerHTML=`
        <div class="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Add some delicious sweets to your cart!</p>
          <a href="index.html#products" class="cta-button">Browse Sweets</a>
        </div>
      `,n.style.display="none",y(0);return}t.innerHTML=`
      <div class="cart-items">
        ${o.map(e=>`
          <div class="cart-item" data-id="${e.id}">
            <img src="${e.products.image_url}" alt="${e.products.name}" class="cart-item-image">
            <div class="cart-item-info">
              <h3>${e.products.name}</h3>
              <p class="cart-item-price">₹${e.products.price}/kg</p>
              <p class="cart-item-quantity">Quantity: ${b(e.quantity)}</p>
            </div>
            <div class="cart-item-controls">
              <button class="qty-btn" onclick="window.decreaseQuantity('${e.id}', ${e.quantity})">-</button>
              <input type="number" value="${e.quantity}" min="0.25" step="0.25" class="qty-input" data-id="${e.id}" onchange="window.updateQuantityFromInput('${e.id}', this.value)">
              <span class="qty-unit">kg</span>
              <button class="qty-btn" onclick="window.increaseQuantity('${e.id}', ${e.quantity})">+</button>
            </div>
            <div class="cart-item-total">
              <p>₹${(e.products.price*e.quantity).toFixed(2)}</p>
            </div>
            <button class="delete-cart-btn" onclick="window.removeFromCart('${e.id}')">×</button>
          </div>
        `).join("")}
      </div>
    `,E(),n.style.display="block",y(o.length)}catch(e){console.error("Error loading cart:",e),t.innerHTML='<p class="loading">Error loading cart. Please try again.</p>'}}function E(){const t=o.reduce((a,c)=>a+c.products.price*c.quantity,0),e=t+50;document.getElementById("subtotal").textContent=`₹${t.toFixed(2)}`,document.getElementById("total").textContent=`₹${e.toFixed(2)}`}function y(t){const n=document.getElementById("cart-count");t>0?(n.textContent=t,n.style.display="inline-block"):n.style.display="none"}function b(t){return t===1?"1 kg":t===.25?"1/4 kg":t===.5?"1/2 kg":t===.75?"3/4 kg":`${t} kg`}window.decreaseQuantity=async function(t,n){const e=Math.max(.25,n-.25);if(e<.25)return window.removeFromCart(t);try{await u(t,e),await d()}catch(a){alert("Error updating quantity: "+a.message)}};window.increaseQuantity=async function(t,n){const e=n+.25;try{await u(t,e),await d()}catch(a){alert("Error updating quantity: "+a.message)}};window.updateQuantityFromInput=async function(t,n){const e=parseFloat(n)||.25;if(e<.25)return window.removeFromCart(t);try{await u(t,e),await d()}catch(a){alert("Error updating quantity: "+a.message)}};window.removeFromCart=async function(t){if(confirm("Remove this item from cart?"))try{await p(t),await d()}catch(n){alert("Error removing item: "+n.message)}};function B(){const t=document.getElementById("logout-btn"),n=document.getElementById("checkout-btn"),e=document.getElementById("checkout-modal"),a=document.querySelector(".close"),c=document.getElementById("checkout-form");t&&t.addEventListener("click",r=>{r.preventDefault(),f(),window.location.href="index.html"}),n&&n.addEventListener("click",()=>{if(o.length===0){alert("Your cart is empty!");return}const i=o.reduce((l,m)=>l+m.products.price*m.quantity,0)+50;document.getElementById("order-total").textContent=`₹${i.toFixed(2)}`,e.style.display="block"}),a&&a.addEventListener("click",()=>{e.style.display="none"}),window.addEventListener("click",r=>{r.target===e&&(e.style.display="none")}),c&&c.addEventListener("submit",async r=>{r.preventDefault(),await C()})}async function C(){const t=document.getElementById("checkout-message"),n=document.getElementById("delivery-address").value,e=document.getElementById("phone").value,a=document.querySelector('input[name="payment"]:checked').value,r=o.reduce((i,l)=>i+l.products.price*l.quantity,0)+50;try{a==="online"&&(t.textContent="Redirecting to payment gateway...",t.className="message",await new Promise(i=>setTimeout(i,2e3))),t.textContent="Placing your order...",t.className="message",await h(s.id,{total_amount:r,delivery_address:n,phone:e,payment_method:a},o),t.textContent=`Order placed successfully! ${a==="cod"?"Cash on Delivery":"Online Payment"} confirmed.`,t.className="message success",setTimeout(()=>{window.location.href="orders.html"},1500)}catch(i){t.textContent="Error placing order: "+i.message,t.className="message error"}}v();
