# 🛠️ TLOPS — Tinkering Lab Operations & Inventory Management System

A multi-page, serverless laboratory inventory tracking and equipment requisition system designed for university tinkering labs and maker spaces.

---

## 🚀 Overview & Key Features

- **Zero-Backend Architecture**: All persistent state (user accounts, inventory components, student requests, and checkout cart) is synchronized locally across student and teacher portals using standard browser `localStorage` (JSON).
- **Role-Based Portals**:
  - **🎓 Student Portal (`/student`)**: Browse component stock with live search, add items to cart, request unlisted hardware, and monitor request statuses (`Pending`, `Approved`, `Rejected`, `Completed`).
  - **👨‍🏫 Teacher / Lab Admin Portal (`/teacher`)**: Executive KPI dashboard, incoming review queue, one-click Approve/Reject with faculty notes, component catalog management (Add, Edit, Delete with confirmation), historical audit logs, and one-click JSON data export.
- **Data Export**: Generates and downloads `users.json`, `requests.json`, and `inventory.json` directly in the browser via Blob URLs.
- **Action Notifications**: In-app toast banners provide feedback for sign-up, sign-in, request submissions, faculty decisions, and inventory additions/deletions.

---

## 📄 Pages Directory

### Authentication & Landing
- [`index.html`](index.html): Role-based sign-in (`Student` / `Teacher`) with institutional email validation, password toggle, and demo accounts.
- [`signup.html`](signup.html): Student and faculty registration with instant form validation and duplicate email prevention.

### Student Portal (`/student`)
- [`student/dashboard.html`](student/dashboard.html): Real-time KPI summary cards, live search inventory quick browse, `+1` cart buttons, and recent request status.
- [`student/cart.html`](student/cart.html): Component quantity controls, return date selector, purpose justification validation, and request submission.
- [`student/requests.html`](student/requests.html): Filterable My Requests table (`All`, `Pending`, `Approved`, `Rejected`, `Completed`), request details modal, and unlisted component requisition form.
- [`student/profile.html`](student/profile.html): Editable student profile with instant sidebar user synchronization.

### Teacher / Admin Portal (`/teacher`)
- [`teacher/dashboard.html`](teacher/dashboard.html): Executive metric cards, live university date header, pending requests queue, and **Export Data** button.
- [`teacher/requests.html`](teacher/requests.html): All pending borrowing requests with borrower details, requested items, and review navigation.
- [`teacher/review-request.html`](teacher/review-request.html): Request inspection, rack location details, stock indicators, and Approve/Reject decision modal with faculty comments.
- [`teacher/inventory.html`](teacher/inventory.html): Equipment catalog with dual real-time text search and category dropdown filters.
- [`teacher/add-component.html`](teacher/add-component.html): New component specification form with icon presets and validation.
- [`teacher/edit-component.html`](teacher/edit-component.html): Modify component specifications, stock thresholds, and delete items with native confirmation.
- [`teacher/history.html`](teacher/history.html): Audit log of all past and completed requests with status pill filters.
- [`teacher/profile.html`](teacher/profile.html): Administrator profile management with live "Logged in as" synchronization across all admin headers.

---

## 🎬 End-to-End Demo Flow

Follow these steps to experience the complete shared-state workflow:

1. **Sign Up / Sign In**:
   - Open [`index.html`](index.html) in any browser.
   - You can click **Sign Up** to create a new student or teacher account, or use the pre-seeded demo accounts:
     - **Student**: `cse001@bmu.edu.in` / `Password@123`
     - **Teacher**: `meera.k@bmu.edu.in` / `Password@123`
   - Sign in as **Student** to enter the Student Dashboard.

2. **Student Submits Request**:
   - Under **Quick Browse**, use the search box to filter components (e.g., type `Arduino` or `Sensor`).
   - Click **+1** on components to add them to your cart.
   - Go to **Cart** ([`student/cart.html`](student/cart.html)), specify your return date, enter your project justification, and click **Submit Request**.
   - A success toast will confirm submission, and the request appears under **My Requests** as `Pending`.

3. **Teacher Approves or Rejects Request**:
   - Click **Logout** from the header to return to [`index.html`](index.html).
   - Switch to the **Teacher** tab and sign in using `meera.k@bmu.edu.in` / `Password@123`.
   - On the **Admin Dashboard**, the Pending Requests counter updates immediately.
   - Open **Requests** ([`teacher/requests.html`](teacher/requests.html)) and click **Review** on the student's request.
   - Click **Approve Request** (enter collection notes) or **Reject Request** (enter reason). The decision is saved instantly.

4. **Student Sees Live Update**:
   - Log back in as **Student** and open **My Requests** ([`student/requests.html`](student/requests.html)).
   - Notice the status badge and pill counters (`Approved` / `Rejected`) update dynamically.
   - Click **View →** to see the requested components along with the faculty comment.

5. **Teacher Inventory Management**:
   - In Teacher view, go to **Inventory** ([`teacher/inventory.html`](teacher/inventory.html)).
   - Click **+ Add Component** to add a new item, or **Edit** to modify quantities.
   - Click **Delete Component** to test the confirmation popup and removal.
   - When you switch back to Student View, the updated inventory and search box reflect these changes in real time.

6. **Export Data**:
   - On the Teacher Dashboard ([`teacher/dashboard.html`](teacher/dashboard.html)), click **Export Data**.
   - Your browser will automatically download:
     - `tlops_users_YYYY-MM-DD.json`
     - `tlops_requests_YYYY-MM-DD.json`
     - `tlops_inventory_YYYY-MM-DD.json`

---

## 🛠️ Technology Stack & Full-Stack Architecture

- **Frontend**: HTML5 & Vanilla JavaScript, CSS3 with responsive flex/grid layouts.
- **Backend Runtime**: Node.js & Express 5.
- **Data Layers**:
  - **Browser Storage**: Web APIs (`localStorage`, `Blob`, `URL.createObjectURL`).
  - **Local File Storage**: Node.js `fs/promises` reading and writing to `server/data/*.json`.
  - **Database Storage**: MongoDB & Mongoose schemas (`Component`, `Request`, `User`) with full CRUD support.
  - **External APIs**: External public electronics catalog integration with live query, transformation, and error fallback.

---

## 🚀 Running the Full-Stack Backend

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the Express server**:
   ```bash
   npm start
   ```
3. **Open the applications**:
   - Web App: `http://localhost:5000/index.html`
   - Interactive API & DB Explorer: `http://localhost:5000/api-demo.html`
   - Server Health Check: `http://localhost:5000/api/health`

### 📡 Available REST API Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **System** | `/api/health` | `GET` | Health check and MongoDB status |
| **External API** | `/api/external/hardware-catalog` | `GET` | Fetch live electronics and hardware from external public API |
| **JSON Files CRUD** | `/api/json/inventory` | `GET`, `POST` | Read all or create new component in local JSON file |
| | `/api/json/inventory/:id` | `GET`, `PUT`, `DELETE` | Read one, update stock, or delete component from JSON file |
| | `/api/json/requests` | `GET`, `POST` | Read all or submit requisition request to JSON file |
| | `/api/json/requests/:id` | `PUT`, `DELETE` | Update decision status or delete request from JSON file |
| **MongoDB CRUD** | `/api/components` | `GET`, `POST` | Read or create component document in MongoDB |
| | `/api/components/:id` | `GET`, `PUT`, `DELETE` | Read, update stock/specs, or delete document from MongoDB |
| | `/api/requests` | `GET`, `POST` | Read or submit request document in MongoDB |
| | `/api/requests/:id` | `PUT`, `DELETE` | Review/approve request document in MongoDB |
| | `/api/users` | `GET`, `POST` | User registration and authentication in MongoDB |

- **HTML5 & Vanilla JavaScript**: No frameworks, no external dependencies, no build tools required.
- **CSS3**: Pure custom stylesheets with CSS variables and responsive flex/grid layouts.
- **Browser Web APIs**: HTML5 `localStorage`, `Blob`, `URL.createObjectURL`, `Intl.DateTimeFormat`.
