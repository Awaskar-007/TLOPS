# 🛠️ TLOPS — Tinkering Lab Operations & Inventory System

<p align="center">
  <b>A centralized, real-time lab inventory and component checkout system designed for college tinkering labs and maker spaces.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active_Development-brightgreen?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/Frontend-HTML5_%7C_CSS3_%7C_JS-blue?style=flat-square" alt="Tech">
  <img src="https://img.shields.io/badge/Hosting-GitHub_Pages-orange?style=flat-square" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/Institute-BML_Munjal_University-navy?style=flat-square" alt="BMU">
</p>

---

## 📖 Origin Story

One day, we visited the tinkering lab at our university to collect materials for our engineering project. We saw our teacher overwhelmed trying to track, allot, and record components manually on paper as dozens of students rushed in simultaneously with varied requests. 

When given an opportunity to build a project for our course curriculum, we knew this was the exact real-world problem we needed to solve. **TLOPS** was born to eliminate manual registers, streamline component allotment, prevent equipment loss, and make lab management effortless for teachers and students alike.

---

## 🌟 Key Features

### 🎓 Student Portal (`/student`)
- **Interactive Component Catalog**: Browse microcontrollers (Arduino Uno, ESP32, Raspberry Pi 4), sensors, and tools with live stock indicators.
- **Request Cart**: Add multiple lab components to a unified checkout cart.
- **Custom Request Specifications**: Specify the required duration (due date), purpose/project reason, and request custom or out-of-stock parts.
- **Live Status Tracking**: Track requests in real time across lifecycle stages (`Pending`, `Approved`, `Completed`).
- **Student Profile**: View registered student ID, department, email, and historical requests.

### 👨‍🏫 Teacher / Lab Admin Portal (`/teacher`)
- **Executive Metrics Dashboard**: Overview of total inventory, active borrows, pending approvals, and low-stock alerts with dynamic university date headers.
- **Request Review Queue**: Review incoming student requests with detailed borrower metadata.
- **One-Click Approval / Rejection**: Approve components for collection or provide rejection reasons.
- **Inventory Management**: Add new laboratory components, edit quantities, and update equipment specifications.
- **Audit & History Log**: Searchable history table of all completed and past checkout records.

### ⚡ Zero-Server Data Synchronization
- Fully functional without requiring an external backend or database setup during prototype testing.
- Uses synchronized browser `localStorage` across student and teacher views so checkout requests, cart contents, approvals, and profile changes persist instantly in real time.

---

## 📂 Repository Structure

The repository is organized following clean, industry-standard multi-page web architecture:

```text
TLOPS/
├── index.html                  # 🚀 Main entry point & role sign-in (GitHub Pages root)
│
├── student/                    # 🎓 Student Portal
│   ├── index.html              # Quick redirect to dashboard
│   ├── dashboard.html          # Student inventory browsing & request hub
│   ├── cart.html               # Cart review & request submission
│   ├── requests.html           # My Requests tracking table & custom requests modal
│   └── profile.html            # Student profile details
│
├── teacher/                    # 👨‍🏫 Teacher / Lab Admin Portal
│   ├── index.html              # Quick redirect to dashboard
│   ├── dashboard.html          # Admin dashboard & laboratory statistics
│   ├── requests.html           # Incoming student request queue
│   ├── review-request.html     # Request approval & component inspection
│   ├── inventory.html          # Lab equipment stock management
│   ├── add-component.html      # Add new equipment modal/page
│   ├── edit-component.html     # Edit equipment details modal/page
│   ├── history.html            # Historical checkout logs
│   └── profile.html            # Lab administrator profile
│
├── css/                        # 🎨 Organized Stylesheets
│   ├── auth.css                # Sign-in & landing page styling
│   ├── student/                # Student-specific styles
│   │   ├── dashboard.css
│   │   ├── cart-profile.css
│   │   └── requests.css
│   └── teacher/                # Teacher-specific styles
│       ├── dashboard.css
│       ├── requests.css
│       ├── review-request.css
│       ├── inventory.css
│       ├── add-component.css
│       ├── edit-component.css
│       ├── history.css
│       └── profile.css
│
├── js/                         # ⚡ Shared JavaScript & Utilities
│   └── main.js                 # Central state helpers, profile utilities & toast notifications
│
├── assets/                     # 🖼️ Static Media & Graphics
│   ├── icons/                  # SVG icons & symbols
│   └── images/                 # Component images & banners
│
├── .gitignore                  # Git ignore rules for OS & IDE files
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Run Locally (No Installation Required)
Since TLOPS is built using standard native web technologies, it requires **zero setup**:
1. Clone or download this repository:
   ```bash
   git clone https://github.com/Awaskar-007/TLOPS.git
   ```
2. Open `index.html` in any web browser (Chrome, Edge, Firefox, Safari) by double-clicking it.
3. Or open the project in **VS Code** and click **"Go Live"** using the **Live Server** extension.

### 2. Deploy to GitHub Pages (1-Click Hosting)
1. In your GitHub repository, navigate to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
3. Select branch: `main` and folder: `/ (root)`.
4. Click **Save**. Your site will be live at:
   ```
   https://<your-username>.github.io/TLOPS/
   ```

---

## 🗺️ Roadmap & Future Vision

- [ ] **Node.js Backend & API**: Migrate simulated `localStorage` to an Express/Next.js REST API.
- [ ] **Database Integration**: Connect MongoDB or PostgreSQL with Prisma ORM for persistent lab records across all devices.
- [ ] **QR Code Scanning**: Rapid check-in and check-out via camera scan of student ID and equipment tags.
- [ ] **University Single Sign-On (SSO)**: Direct authentication with institutional Google Workspace / LDAP accounts.
- [ ] **Automated Email / SMS Alerts**: Notifications when a request is approved or overdue.

---

## 👥 Authors & Contributors

- **Devasis Awaskar** — Founder & Fullstack Developer ([GitHub](https://github.com/Awaskar-007))
- **Aarush Shrivastava** — Founder & Frontend Developer ([GitHub](https://github.com/Highusername))

---

<p align="center">
  Made with ❤️ for BMU Tinkering Lab
</p>
