import{l as c,a as r,b as y,c as u,d as g}from"./db-Ddrb56FG.js";let a=null;async function p(){a=await r(),m(a),await k(),a&&await s()}function m(e){const t=document.getElementById("admin-link"),n=document.getElementById("auth-link"),o=document.getElementById("logout-link"),i=document.getElementById("cart-link"),l=document.getElementById("orders-link");e?(n.style.display="none",o.style.display="block",i.style.display="block",l.style.display="block",e.is_admin&&(t.style.display="block")):(n.style.display="block",o.style.display="none",t.style.display="none",i.style.display="none",l.style.display="none")}async function s(){if(a)try{const e=await u(a.id),t=document.getElementById("cart-count");e.length>0?(t.textContent=e.length,t.style.display="inline-block"):t.style.display="none"}catch(e){console.error("Error updating cart count:",e)}}async function k(){const e=document.getElementById("products-grid");try{const t=await y();if(t.length===0){e.innerHTML='<p class="loading">No products available yet.</p>';return}e.innerHTML=t.map(n=>`
      <div class="product-card">
        <img src="${n.image_url}" alt="${n.name}" class="product-image">
        <div class="product-info">
          <h3 class="product-name">${n.name}</h3>
          <p class="product-description">${n.description}</p>
          <p class="product-price">₹${n.price}/kg</p>
          ${a?`
            <div class="quantity-selector">
              <label>Select Quantity:</label>
              <div class="quantity-buttons">
                <button class="qty-option-btn" onclick="window.handleAddToCart('${n.id}', 0.25)" data-qty="0.25">1/4 kg</button>
                <button class="qty-option-btn" onclick="window.handleAddToCart('${n.id}', 0.5)" data-qty="0.5">1/2 kg</button>
                <button class="qty-option-btn" onclick="window.handleAddToCart('${n.id}', 0.75)" data-qty="0.75">3/4 kg</button>
                <button class="qty-option-btn" onclick="window.handleAddToCart('${n.id}', 1)" data-qty="1">1 kg</button>
              </div>
            </div>
          `:'<p class="login-prompt">Login to add to cart</p>'}
        </div>
      </div>
    `).join("")}catch(t){console.error("Error loading products:",t),e.innerHTML='<p class="loading">Error loading products. Please try again later.</p>'}}window.handleAddToCart=async function(e,t=1){if(!a){alert("Please login to add items to cart"),window.location.href="auth.html";return}try{await g(a.id,e,t),await s();const n=t===1?"1 kg":t===.5?"1/2 kg":t===.25?"1/4 kg":t===.75?"3/4 kg":`${t} kg`,o=document.createElement("div");o.className="cart-notification",o.textContent=`Added ${n} to cart!`,document.body.appendChild(o),setTimeout(()=>{o.style.opacity="0",setTimeout(()=>o.remove(),300)},2e3)}catch(n){alert("Error adding to cart: "+n.message)}};const d=document.getElementById("logout-btn");d&&d.addEventListener("click",e=>{e.preventDefault(),c(),window.location.href="index.html"});p();
