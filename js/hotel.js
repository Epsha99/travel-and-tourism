document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Budget Calculator
    // ==========================================
    const calcBtn = document.getElementById('calc-budget-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const totalBudget = parseFloat(document.getElementById('total-budget').value) || 0;
            const transport = parseFloat(document.getElementById('exp-transport').value) || 0;
            const hotel = parseFloat(document.getElementById('exp-hotel').value) || 0;
            const food = parseFloat(document.getElementById('exp-food').value) || 0;
            const activities = parseFloat(document.getElementById('exp-activities').value) || 0;

            const totalExpenses = transport + hotel + food + activities;
            const remainingBalance = totalBudget - totalExpenses;

            // Update DOM with expenses
            const expenseList = document.getElementById('expense-list-output');
            expenseList.innerHTML = `
                <li>✈️ Transport: <strong>$${transport.toFixed(2)}</strong></li>
                <li>🏨 Hotel: <strong>$${hotel.toFixed(2)}</strong></li>
                <li>🍔 Food: <strong>$${food.toFixed(2)}</strong></li>
                <li>🎟️ Activities: <strong>$${activities.toFixed(2)}</strong></li>
            `;

            // Update Remaining Balance
            const balanceDisplay = document.getElementById('balance-amount');
            balanceDisplay.innerText = `$${remainingBalance.toFixed(2)}`;
            
            // Visual feedback for over-budget
            if (remainingBalance < 0) {
                balanceDisplay.style.color = '#ef4444'; // Red
            } else {
                balanceDisplay.style.color = 'inherit';
            }
        });
    }

    // ==========================================
    // 2. Hotel Booking & Cart Management
    // ==========================================
    let cart = [];
    const bookBtns = document.querySelectorAll('.book-hotel-btn');
    
    bookBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const hotelCard = e.target.closest('.hotel-card');
            const hotelName = hotelCard.querySelector('h3').innerText;
            const hotelPrice = hotelCard.querySelector('.price strong').innerText;
            
            cart.push({ title: hotelName, price: hotelPrice });
            updateCart();
            
            // Temporary button feedback
            const originalText = e.target.innerText;
            e.target.innerText = "Added!";
            setTimeout(() => e.target.innerText = originalText, 1500);
        });
    });

    function updateCart() {
        // Update Nav Counter
        document.getElementById('nav-cart-btn').innerText = `My Cart (${cart.length})`;
        
        const cartArea = document.getElementById('cart-display-area');
        
        if(cart.length === 0) {
            cartArea.innerHTML = '<p class="empty-msg">Your cart is empty. Start exploring!</p>';
            return;
        }

        let html = '';
        let totalCost = 0;

        cart.forEach((item, index) => {
            const numericPrice = parseFloat(item.price.replace('$', ''));
            totalCost += numericPrice;

            html += `
                <div class="basket-item">
                    <div class="basket-info">
                        <h4>${item.title}</h4>
                    </div>
                    <div class="basket-price-zone">
                        <div class="basket-cost">${item.price}/night</div>
                        <button class="toss-btn" data-index="${index}">Remove</button>
                    </div>
                </div>`;
        });

        html += `
            <div class="cart-footer">
                <span>Estimated Total (1 Night):</span>
                <span class="cart-total">$${totalCost.toFixed(2)}</span>
            </div>
            <button class="btn btn-primary w-100" style="margin-top: 15px;">Checkout</button>
        `;

        cartArea.innerHTML = html;

        // Attach remove event listeners
        document.querySelectorAll('.toss-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                cart.splice(index, 1);
                updateCart();
            });
        });
    }

    // ==========================================
    // 3. Mock Weather API
    // ==========================================
    const weatherBtn = document.getElementById('get-weather-btn');
    if (weatherBtn) {
        weatherBtn.addEventListener('click', () => {
            const cityInput = document.getElementById('weather-city-input').value;
            if(!cityInput) return;

            document.getElementById('weather-city-name').innerText = cityInput;
            
            // Randomize mock weather data
            const temps = [68, 72, 75, 80, 85];
            const conditions = ['Sunny', 'Partly Cloudy', 'Raining', 'Clear'];
            const icons = ['☀️', '⛅', '🌧️', '✨'];
            
            const randIndex = Math.floor(Math.random() * temps.length);
            
            document.getElementById('weather-temp').innerText = `${temps[randIndex]}°F / ${Math.round((temps[randIndex] - 32) * 5/9)}°C`;
            document.getElementById('weather-desc').innerText = conditions[randIndex % conditions.length];
            document.querySelector('.current-weather .placeholder-icon').innerText = icons[randIndex % icons.length];
        });
    }
});
