// 1. Initial Data and LocalStorage Helpers
const defaultCoupons = [
    { id: 1, store: "Domino's Pizza", code: "LPU50", discount: "50% OFF", category: "food", minSpend: "₹399" },
    { id: 2, store: "Campus Book Depot", code: "BOOK20", discount: "20% OFF", category: "books", minSpend: "₹200" },
    { id: 3, store: "HP Tech Store", code: "TECH15", discount: "15% OFF", category: "tech", minSpend: "₹1000" },
    { id: 4, store: "Subway Uni-Mall", code: "SUB30", discount: "30% OFF", category: "food", minSpend: "₹199" }
];

function getCoupons() {
    const data = localStorage.getItem("coupons");
    if (!data) {
        localStorage.setItem("coupons", JSON.stringify(defaultCoupons));
        return defaultCoupons;
    }
    return JSON.parse(data);
}

function saveCoupons(arr) {
    localStorage.setItem("coupons", JSON.stringify(arr));
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(arr) {
    localStorage.setItem("cart", JSON.stringify(arr));
    updateCartCount();
}

function updateCartCount() {
    const el = document.getElementById("cartNavCount");
    if (el) el.textContent = getCart().length;
}

// 2. Home Page: Catalogue, Search & Category Filters
function initCatalogue() {
    const list = document.getElementById("couponList");
    if (!list) return;

    window.renderCatalogue = function(data) {
        list.innerHTML = data.map(item => `
            <div class="coupon-card">
                <div>
                    <h3>${item.store}</h3>
                    <div class="discount">${item.discount}</div>
                    <div class="code-box">${item.code}</div>
                    <small>Min. Spend: ${item.minSpend || '₹0'}</small>
                </div>
                <div class="card-actions" style="margin-top: 10px;">
                    <button type="button" class="btn" onclick="copyCode('${item.code}')">Copy</button>
                    <button type="button" class="btn btn-green" onclick="addToCart(${item.id})">Save to Cart</button>
                </div>
            </div>
        `).join("");
    };

    window.searchCoupons = function() {
        const q = document.getElementById("searchInput").value.toLowerCase();
        const filtered = getCoupons().filter(c => c.store.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
        renderCatalogue(filtered);
    };

    window.filterCat = function(cat, btn) {
        document.querySelectorAll(".btn-cat").forEach(b => b.classList.remove("active"));
        if (btn) btn.classList.add("active");
        renderCatalogue(cat === "all" ? getCoupons() : getCoupons().filter(c => c.category === cat));
    };

    window.copyCode = function(code) {
        navigator.clipboard.writeText(code);
        alert("Coupon code copied: " + code);
    };

    window.addToCart = function(id) {
        const cart = getCart();
        if (cart.includes(id)) {
            alert("This coupon is already in your cart!");
        } else {
            cart.push(id);
            saveCart(cart);
            alert("Coupon added to Cart successfully!");
        }
    };

    renderCatalogue(getCoupons());
}

// 3. Cart Page
function initCart() {
    const tableBody = document.getElementById("cartTableBody");
    if (!tableBody) return;

    window.renderCart = function() {
        const cartIds = getCart();
        const coupons = getCoupons().filter(c => cartIds.includes(c.id));
        document.getElementById("totalSaved").textContent = coupons.length;

        if (coupons.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Your cart is empty. Go to Home to add coupons!</td></tr>`;
            return;
        }

        tableBody.innerHTML = coupons.map(c => `
            <tr>
                <td><b>${c.store}</b></td>
                <td><code>${c.code}</code></td>
                <td><b style="color:#d97706;">${c.discount}</b></td>
                <td>${c.category}</td>
                <td><button type="button" class="btn btn-red" onclick="removeFromCart(${c.id})">Remove</button></td>
            </tr>
        `).join("");
    };

    window.removeFromCart = function(id) {
        const cart = getCart().filter(item => item !== id);
        saveCart(cart);
        renderCart();
    };

    renderCart();
}

// 4. Checkout Page
function initCheckout() {
    const form = document.getElementById("checkoutForm");
    if (!form) return;

    form.onsubmit = function(event) {
        event.preventDefault();
        const name = document.getElementById("studentName").value;
        const regNo = document.getElementById("studentReg").value;
        const store = document.getElementById("selectedStore").value;
        const code = document.getElementById("selectedCode").value;

        const voucherId = "LPU-VOUCH-" + Math.floor(1000 + Math.random() * 9000);
        const slip = document.getElementById("voucherSlip");
        slip.innerHTML = `
            <h3>Student Redemption Voucher</h3>
            <p>Voucher Token: <b>${voucherId}</b></p>
            <div class="voucher-code">${code}</div>
            <p>Claimed By: <b>${name}</b> (Reg: ${regNo}) for <b>${store}</b></p>
            <p style="color:green; font-weight:bold; margin-top:8px;">Status: Valid & Ready to Use at Campus Counter</p>
        `;
        slip.style.display = "block";
    };
}

// 5. Ratings & Reviews Page
function initRatings() {
    const list = document.getElementById("reviewsList");
    if (!list) return;

    const defaultReviews = [
        { store: "Domino's Pizza", rating: "5 Star", user: "Aman (Student)", comment: "Worked instantly at LPU gate delivery!" },
        { store: "Campus Book Depot", rating: "4 Star", user: "Neha (ECE)", comment: "Saved ₹250 on my semester textbooks." }
    ];

    function getReviews() {
        return JSON.parse(localStorage.getItem("reviews") || JSON.stringify(defaultReviews));
    }

    window.renderReviews = function() {
        list.innerHTML = getReviews().map(r => `
            <div style="border-bottom: 1px solid #e2e8f0; padding: 10px 0;">
                <b style="color:#1e3a8a;">${r.store}</b> - <span style="color:#d97706; font-weight:bold;">${r.rating}</span>
                <p style="font-size:13px; color:#334155;">"${r.comment}"</p>
                <small style="color:#64748b;">By: ${r.user}</small>
            </div>
        `).join("");
    };

    document.getElementById("reviewForm").onsubmit = function(e) {
        e.preventDefault();
        const reviews = getReviews();
        reviews.unshift({
            store: document.getElementById("revStore").value,
            rating: document.getElementById("revRating").value,
            user: document.getElementById("revUser").value,
            comment: document.getElementById("revComment").value
        });
        localStorage.setItem("reviews", JSON.stringify(reviews));
        renderReviews();
        e.target.reset();
        alert("Review submitted successfully!");
    };

    renderReviews();
}

// 6. Admin Control Page (CRUD)
function initAdmin() {
    const tableBody = document.getElementById("adminTableBody");
    if (!tableBody) return;

    window.renderAdminTable = function() {
        const coupons = getCoupons();
        tableBody.innerHTML = coupons.map(c => `
            <tr>
                <td><b>${c.store}</b></td>
                <td><code>${c.code}</code></td>
                <td>${c.discount}</td>
                <td>${c.category}</td>
                <td><button type="button" class="btn btn-red" onclick="deleteCoupon(${c.id})">Delete</button></td>
            </tr>
        `).join("");
    };

    document.getElementById("addCouponForm").onsubmit = function(e) {
        e.preventDefault();
        const coupons = getCoupons();
        coupons.push({
            id: Date.now(),
            store: document.getElementById("storeName").value,
            code: document.getElementById("couponCode").value,
            discount: document.getElementById("discountVal").value,
            category: document.getElementById("categorySelect").value,
            minSpend: document.getElementById("minSpend").value || "₹0"
        });
        saveCoupons(coupons);
        renderAdminTable();
        e.target.reset();
        alert("Coupon successfully added to the catalogue!");
    };

    window.deleteCoupon = function(id) {
        if (confirm("Are you sure you want to delete this coupon?")) {
            saveCoupons(getCoupons().filter(c => c.id !== id));
            renderAdminTable();
        }
    };

    renderAdminTable();
}

// 7. Student Login & Sign Up Page
function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.onsubmit = function(e) {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        document.getElementById("loginStatus").textContent = "Logged in as " + email;
        document.getElementById("loginStatus").style.color = "green";
        alert("Login Successful! Welcome to UniDeals.");
    };

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById("signName").value;
            alert("Registration successful for " + name + "! You can now log in.");
            signupForm.reset();
        };
    }
}

// Universal initialization on page load
window.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    initCatalogue();
    initCart();
    initCheckout();
    initRatings();
    initAdmin();
    initLogin();
});
