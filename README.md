# 🛒 iHerb Frontend — Angular E-Commerce

> **Modern Angular application for a full-featured e-commerce platform**
> Focused on health products, supplements, and gym equipment.

This project represents the **frontend layer** of a full-stack system, built with Angular and integrated with a .NET 8 backend API.

---

## 🚀 Overview

A real-world **e-commerce frontend experience** including:

* Product discovery & filtering
* Secure authentication flow
* Shopping cart & checkout
* Real-time features
* Responsive UI across all devices

---

## ✨ Key Features

### 🛍️ Shopping Experience

* Product listing with **Search, Filters, and Categories**
* Interactive **Category Slider**
* Product details and dynamic UI updates

### 🛒 Cart & Checkout

* Real-time cart updates
* Full checkout workflow
* Stripe payment integration

### 🔐 Authentication & Users

* Login & Register system
* OTP Email Verification
* Protected routes using Angular Guards:

  * Auth Guard
  * No-Auth Guard
  * Email Verification Guard

### ⚡ Real-Time Features

* SignalR-powered **Chat Bot**
* Live interaction with backend services

### 📱 UI/UX

* Fully responsive (Mobile + Desktop)
* Clean and modern design
* Smooth navigation & user flow

---

## 🏗️ Project Structure

```bash
src/
├── app/
│   ├── components/       # UI components (Home, Products, Cart, Checkout...)
│   ├── guards/           # Route guards (auth, no-auth, verify-email)
│   ├── models/           # Interfaces (Product, User, Cart...)
│   ├── services/         # API services (Auth, Product, Cart, Payment...)
│   ├── environments/     # Environment configs
│   ├── app.component.ts
│   ├── app.routes.ts
│   └── app.config.ts
├── assets/
└── styles.css
```

---

## 🛠️ Tech Stack

| Technology                   | Usage                      |
| ---------------------------- | -------------------------- |
| Angular 18+                  | Frontend framework         |
| TypeScript                   | Core language              |
| RxJS                         | Reactive programming       |
| Angular Material / Bootstrap | UI & styling               |
| HttpClient                   | API communication          |
| SignalR Client               | Real-time features         |
| Reactive Forms               | Form handling & validation |
| Routing + Guards             | Navigation & security      |

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/3laamobarak/ITI.Final.Front.git
cd ITI.Final.Front
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure API URL ⚠️

Update:
`src/environments/environment.ts`

```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5297/api'
};
```

> Make sure the backend is running on the same port.

---

### 4. Run the Application

```bash
ng serve
```

Then open:
👉 http://localhost:4200

---

## 🔗 Backend Integration

This frontend works with the .NET backend:

👉 https://github.com/3laamobarak/ITI-Final-Project

* REST API communication
* Secure authentication & payments handled server-side
* SignalR used for real-time features

---

## 📌 Notes

* Designed as part of a **full-stack architecture**
* Backend handles all sensitive logic (Auth, Payments, Orders)
* Frontend focuses on **performance, UX, and responsiveness**
* Easily extendable for mobile or PWA

---

## 👨‍💻 Author

**Alaa Mobarak**
.NET Full-Stack & Angular Developer
ITI Qena — 6 Months Internship
Final Graduation Project

---

## ⭐ Support

If you like this project:

* ⭐ Star the repository
* 🍴 Fork it
* 🧠 Suggest improvements

---

## 📬 Feedback

Feel free to open an issue or share your feedback!

---

🚀 *Built with passion for modern e-commerce experiences*
