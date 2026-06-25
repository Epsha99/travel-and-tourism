const placesList = [
    { name: "Kyoto, Japan", cost: 115000, category: "city", season: "Spring", rating: 4.9 },
    { name: "Bali, Indonesia", cost: 70000, category: "beach", season: "Summer", rating: 4.7 },
    { name: "Swiss Alps", cost: 215000, category: "mountain", season: "Winter", rating: 4.9 },
    { name: "Rome, Italy", cost: 105000, category: "city", season: "Autumn", rating: 4.8 },
    { name: "Maui, Hawaii", cost: 175000, category: "beach", season: "Summer", rating: 4.8 },
    { name: "Banff, Canada", cost: 130000, category: "mountain", season: "Autumn", rating: 4.9 },
    { name: "Cairo, Egypt", cost: 75000, category: "city", season: "Winter", rating: 4.5 }
];


const categorySeasons = {
    all: [ { period: "Spring", tourists: 85 }, { period: "Summer", tourists: 100 }, { period: "Autumn", tourists: 70 }, { period: "Winter", tourists: 55 } ],
    beach: [ { period: "Spring", tourists: 70 }, { period: "Summer", tourists: 120 }, { period: "Autumn", tourists: 50 }, { period: "Winter", tourists: 30 } ],
    mountain: [ { period: "Spring", tourists: 40 }, { period: "Summer", tourists: 60 }, { period: "Autumn", tourists: 90 }, { period: "Winter", tourists: 130 } ],
    city: [ { period: "Spring", tourists: 95 }, { period: "Summer", tourists: 85 }, { period: "Autumn", tourists: 100 }, { period: "Winter", tourists: 80 } ]
};

const hotelBank = [
    { id: 101, name: "Grand Plaza Hotel", price: 12500, rating: "⭐⭐⭐⭐⭐", reviews: 240, perks: ["Wi-Fi", "Pool", "Spa"] },
    { id: 102, name: "Oceanview Resort", price: 18000, rating: "⭐⭐⭐⭐", reviews: 189, perks: ["Beachfront", "Breakfast"] },
    { id: 103, name: "Mountain Retreat", price: 9500, rating: "⭐⭐⭐⭐", reviews: 112, perks: ["Hiking", "Fireplace", "Breakfast"] },
    { id: 104, name: "City Center Inn", price: 5500, rating: "⭐⭐⭐", reviews: 345, perks: ["Wi-Fi", "City View"] }
];

let shoppingCart = [];

function setupQuickStats(selection = "all") {
    let activeSet = placesList;

    if (selection !== "all") {
        activeSet = placesList.filter(p => p.category === selection);
    }

    if (activeSet.length === 0) return;

    let totalCash = 0;
    for (let i = 0; i < activeSet.length; i++) {
        totalCash += activeSet[i].cost;
    }
    let avg = Math.round(totalCash / activeSet.length);

    let copy = [...activeSet];
    copy.sort((a, b) => b.rating - a.rating);
    let bestSpot = copy[0].name;

    let displayCat = "";
    if (selection === "all") {
        let counts = {};
        let highest = 0;
        for (let j = 0; j < placesList.length; j++) {
            let cat = placesList[j].category;
            counts[cat] = (counts[cat] || 0) + 1;
            if (counts[cat] > highest) {
                highest = counts[cat];
                displayCat = cat;
            }
        }
    } else {
        displayCat = selection;
    }

    document.getElementById("stat-popular").textContent = bestSpot;
    document.getElementById("stat-avg-cost").textContent = `₹${avg.toLocaleString('en-IN')}`;
    document.getElementById("stat-trending").textContent = displayCat.charAt(0).toUpperCase() + displayCat.slice(1);
}

function drawGraph(selection = "all") {
    let graphZone = document.getElementById("main-analytics-chart");
    if (!graphZone) return;
    
    graphZone.innerHTML = "";
    graphZone.style.display = "flex";
    graphZone.style.alignItems = "flex-end";
    graphZone.style.justifyContent = "space-evenly";
    graphZone.style.paddingTop = "30px";
    graphZone.style.background = "transparent";

    let currentData = categorySeasons[selection] || categorySeasons["all"];

    let peak = 0;
    for (let i = 0; i < currentData.length; i++) {
        if (currentData[i].tourists > peak) {
            peak = currentData[i].tourists;
        }
    }

    for (let j = 0; j < currentData.length; j++) {
        let item = currentData[j];
        
        let col = document.createElement("div");
        col.style.display = "flex";
        col.style.flexDirection = "column";
        col.style.alignItems = "center";
        col.style.flex = "1";
        col.style.height = "100%";
        col.style.justifyContent = "flex-end";

        
        let heightPct = (item.tourists / peak) * 80;

        let bar = document.createElement("div");
        bar.style.width = "45%";
        bar.style.height = "0%"; 
        bar.style.backgroundColor = "#2563eb";
        bar.style.borderRadius = "6px 6px 0 0";
        bar.style.transition = "height 0.5s ease-out"; 

        let label = document.createElement("span");
        label.textContent = item.period;
        label.style.fontSize = "0.85rem";
        label.style.marginTop = "10px";
        label.style.fontWeight = "500";

        col.appendChild(bar);
        col.appendChild(label);
        graphZone.appendChild(col);

        
        setTimeout(() => {
            bar.style.height = `${heightPct}%`;
        }, 50);
    }
}

function renderRecs(selection = "all") {
    let targetBox = document.getElementById("recommendation-list");
    targetBox.innerHTML = "";

    let activeSet = placesList;

    if (selection !== "all") {
        activeSet = placesList.filter(p => p.category === selection);
    }

    let mixed = [...activeSet].sort(() => Math.random() - 0.5);
    let duo = mixed.slice(0, 2);

    if (duo.length === 0) {
        targetBox.innerHTML = `<p style="padding:15px; color:#64748b;">No recommendations ready for this view. Try another option.</p>`;
        return;
    }

    for (let k = 0; k < duo.length; k++) {
        let item = duo[k];

        let row = document.createElement("div");
        row.className = "rec-item glass-effect";

        let pic = document.createElement("div");
        pic.className = "rec-img placeholder-img";
        pic.textContent = `${item.rating}★`;
        pic.style.background = "#0ea5e9";
        pic.style.color = "#fff";
        pic.style.fontSize = "0.9rem";

        let infoBox = document.createElement("div");
        infoBox.className = "rec-details";

        let mainHeading = document.createElement("h4");
        mainHeading.textContent = item.name;

        let moneyFormatted = item.cost.toLocaleString('en-IN');
        let desc = document.createElement("p");
        desc.textContent = `Avg. budget: ₹${moneyFormatted} — Best in ${item.season}`;

        infoBox.appendChild(mainHeading);
        infoBox.appendChild(desc);

        row.appendChild(pic);
        row.appendChild(infoBox);

        targetBox.appendChild(row);
    }
}

function syncCartUI() {
    let displayArea = document.getElementById("cart-display-area");
    let navText = document.getElementById("nav-cart-btn");
    
    if (navText) {
        navText.textContent = `My Cart (${shoppingCart.length})`;
    }

    if (shoppingCart.length === 0) {
        displayArea.innerHTML = `<p class="empty-msg">Your cart is empty. Start exploring!</p>`;
        return;
    }

    displayArea.innerHTML = "";
    let moneySum = 0;

    for (let z = 0; z < shoppingCart.length; z++) {
        let entry = shoppingCart[z];
        moneySum += entry.price;

        let rowBox = document.createElement("div");
        rowBox.className = "basket-item";

        let leftSide = document.createElement("div");
        leftSide.className = "basket-info";
        
        let labelName = document.createElement("h4");
        labelName.textContent = entry.name;
        
        let labelType = document.createElement("p");
        labelType.textContent = "Hotel Stay - 1 Night";

        leftSide.appendChild(labelName);
        leftSide.appendChild(labelType);

        let rightSide = document.createElement("div");
        rightSide.className = "basket-price-zone";

        let costMark = document.createElement("div");
        costMark.className = "basket-cost";
        costMark.textContent = `₹${entry.price.toLocaleString('en-IN')}`;

        let trashBtn = document.createElement("button");
        trashBtn.className = "toss-btn";
        trashBtn.textContent = "Remove";
        trashBtn.addEventListener("click", function() {
            shoppingCart.splice(z, 1);
            syncCartUI();
        });

        rightSide.appendChild(costMark);
        rightSide.appendChild(trashBtn);

        rowBox.appendChild(leftSide);
        rowBox.appendChild(rightSide);
        
        displayArea.appendChild(rowBox);
    }

    let bottomSection = document.createElement("div");
    bottomSection.className = "cart-footer";

    let bigTotal = document.createElement("div");
    bigTotal.className = "cart-total";
    bigTotal.textContent = `Total: ₹${moneySum.toLocaleString('en-IN')}`;

    let payBtn = document.createElement("button");
    payBtn.className = "btn btn-primary";
    payBtn.textContent = "Secure Checkout";
    payBtn.addEventListener("click", function() {
        alert(`Payment of ₹${moneySum.toLocaleString('en-IN')} successful! Your bookings are confirmed.`);
        shoppingCart = [];
        syncCartUI();
    });

    bottomSection.appendChild(bigTotal);
    bottomSection.appendChild(payBtn);

    displayArea.appendChild(bottomSection);
}

function buildHotels() {
    let hotelGrid = document.getElementById("hotel-grid");
    if (!hotelGrid) return;
    
    hotelGrid.innerHTML = "";

    for (let m = 0; m < hotelBank.length; m++) {
        let stay = hotelBank[m];

        let box = document.createElement("div");
        box.className = "card hotel-card";

        let textBody = document.createElement("div");
        textBody.className = "card-body";

        let topRow = document.createElement("div");
        topRow.className = "hotel-header";

        let stayName = document.createElement("h3");
        stayName.textContent = stay.name;

        let formattedPrice = stay.price.toLocaleString('en-IN');
        let costLabel = document.createElement("span");
        costLabel.className = "price";
        costLabel.innerHTML = `<strong>₹${formattedPrice}</strong>/night`;

        topRow.appendChild(stayName);
        topRow.appendChild(costLabel);

        let score = document.createElement("p");
        score.className = "rating";
        score.textContent = `${stay.rating} (${stay.reviews} Reviews)`;

        let tagBox = document.createElement("div");
        tagBox.className = "amenities";

        for (let n = 0; n < stay.perks.length; n++) {
            let pill = document.createElement("span");
            pill.className = "badge";
            pill.textContent = stay.perks[n];
            tagBox.appendChild(pill);
        }

        let actionBtn = document.createElement("button");
        actionBtn.className = "btn btn-primary w-100 book-hotel-btn";
        actionBtn.textContent = "Book Now";
        
        actionBtn.addEventListener("click", function() {
            shoppingCart.push({
                id: stay.id,
                name: stay.name,
                price: stay.price
            });
            syncCartUI();
            window.location.href = "#cart";
        });

        textBody.appendChild(topRow);
        textBody.appendChild(score);
        textBody.appendChild(tagBox);
        textBody.appendChild(actionBtn);

        box.appendChild(textBody);
        hotelGrid.appendChild(box);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    setupQuickStats("all");
    drawGraph("all");
    renderRecs("all");
    buildHotels();
    syncCartUI();

    let dropdown = document.getElementById("filter-category");
    if (dropdown) {
        dropdown.addEventListener("change", function(e) {
            let userChoice = e.target.value;
            setupQuickStats(userChoice);
            drawGraph(userChoice);
            renderRecs(userChoice);
        });
    }
});