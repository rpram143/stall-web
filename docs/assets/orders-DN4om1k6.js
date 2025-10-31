import{a as o,n as s,l as d}from"./db-Ddrb56FG.js";let r=null;async function a(){if(r=await o(),!r){alert("Please login to view your orders"),window.location.href="auth.html";return}l(r),await c(),g()}function l(t){const n=document.getElementById("admin-link"),e=document.getElementById("auth-link"),i=document.getElementById("logout-link");t&&(e.style.display="none",i.style.display="block",t.is_admin&&(n.style.display="block"))}async function c(){const t=document.getElementById("orders-content");try{const n=await s(r.id);if(n.length===0){t.innerHTML=`
        <div class="empty-cart">
          <h3>No orders yet</h3>
          <p>Start shopping for delicious Tamil Nadu sweets!</p>
          <a href="index.html#products" class="cta-button">Browse Sweets</a>
        </div>
      `;return}t.innerHTML=n.map(e=>`
      <div class="order-card">
        <div class="order-header">
          <div>
            <h3>Order #${e.id.substring(0,8)}</h3>
            <p class="order-date">${new Date(e.created_at).toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
          </div>
          <div class="order-status ${e.status}">
            ${u(e.status)}
          </div>
        </div>

        <div class="order-items">
          ${e.order_items.map(i=>`
            <div class="order-item">
              <img src="${i.products.image_url}" alt="${i.product_name}" class="order-item-image">
              <div class="order-item-details">
                <h4>${i.product_name}</h4>
                <p>Quantity: ${i.quantity} kg</p>
                <p class="order-item-price">₹${i.price}/kg</p>
              </div>
              <div class="order-item-total">
                <strong>₹${(i.price*i.quantity).toFixed(2)}</strong>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="order-footer">
          <div class="order-address">
            <strong>Delivery Address:</strong>
            <p>${e.delivery_address}</p>
            <p>Phone: ${e.phone}</p>
          </div>
          <div class="order-total">
            <strong>Total: ₹${e.total_amount.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    `).join("")}catch(n){console.error("Error loading orders:",n),t.innerHTML='<p class="loading">Error loading orders. Please try again.</p>'}}function u(t){return{pending:"Pending",confirmed:"Confirmed",delivered:"Delivered"}[t]||t}function g(){const t=document.getElementById("logout-btn");t&&t.addEventListener("click",n=>{n.preventDefault(),d(),window.location.href="index.html"})}a();
