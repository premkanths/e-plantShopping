# 🌿 Paradise Nursery - Houseplant E-Commerce Store

Welcome to **Paradise Nursery**, a modern and responsive e-commerce web application for purchasing houseplants. This project is built using **React**, **Redux Toolkit**, and **Vite** for fast performance and elegant state management.

---

## 📖 Table of Contents
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [Getting Started](#-getting-started)
- [How State Management Works](#-how-state-management-works)
- [Screenshots](#-screenshots)

---

## ✨ Features

### 1. Landing Page
- A visually stunning introductory page featuring a lush, high-quality blurred nature background.
- Clear brand name **"Paradise Nursery"** along with a mission statement.
- **"Get Started"** button with premium hover animations that transitions smoothly to the plant store page.

### 2. Product Catalog (`ProductList.jsx`)
- Plants grouped logically by categories (e.g., *Air Purifying Plants*, *Aromatic Fragrant Plants*, and *Low Maintenance Plants*).
- Interactive plant cards showing plant image, name, price, description, and an **"Add to Cart"** button.
- Disabled "Added to Cart" state once a plant is in the cart, preventing duplicate clicks.
- Header showing current shopping cart badge count that updates in real-time.

### 3. Shopping Cart (`CartItem.jsx`)
- Lists all selected plants with full image, name, unit cost, and subtotals.
- **Quantity Adjuster:** Simple `+` and `-` controls to increase or decrease item quantity. Decrementing past 1 automatically prompts removal.
- **Total Amount Calculator:** Sums the total quantity and the final cost of all plants.
- **"Continue Shopping"** button to go back to browsing plants.
- **"Checkout"** button to simulate completing the order.

---

## 📁 Project Structure

```text
e-plantShopping/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AboutUs.jsx
│   │   ├── CartItem.css
│   │   ├── CartItem.jsx
│   │   ├── ProductList.css
│   │   └── ProductList.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── CartSlice.jsx
│   ├── main.jsx
│   ├── store.js
│   └── index.css
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## 🛠️ Technologies Used
- **Frontend Framework:** React (v18)
- **State Management:** Redux Toolkit & React-Redux (v9)
- **Bundler & Dev Server:** Vite
- **Styling:** Custom Vanilla CSS with modern flex/grid layouts and Google Font imports (Inter)

---

## 🚀 Getting Started

To run the project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/premkanths/e-plantShopping.git
   cd e-plantShopping
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:5173](http://localhost:5173) to see the application running.

---

## 🧠 How State Management Works
The global state of the shopping cart is managed using **Redux Toolkit** inside `CartSlice.jsx`. It exposes three main actions:
1. `addItem`: Appends a new plant object to the cart array or increments the quantity if it already exists.
2. `removeItem`: Filters out the specified plant from the cart array using its unique name.
3. `updateQuantity`: Targets a specific plant and updates its quantity value directly based on user input.
