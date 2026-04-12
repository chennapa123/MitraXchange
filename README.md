# 🏘️MitraExchange— Neighborhood Resource Exchange Platform

A full-stack MERN web application that lets neighbors share household items — borrow a drill, lend a book, build community.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, CSS      |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT + bcryptjs                      |
| Real-time  | Socket.io                           |
| Uploads    | Multer                              |


---

## 📁 Project Structure

```
neighborhood-exchange/
├── backend/
│   ├── models/          # Mongoose schemas (User, Item, BorrowRequest, Message)
│   ├── routes/          # Express route handlers
│   ├── middleware/      # JWT auth middleware
│   ├── uploads/         # Uploaded item images (auto-created)
│   ├── server.js        # Entry point + Socket.io setup
│   └── .env.example     # Environment variable template
└── frontend/
    ├── public/
    └── src/
        ├── components/  # Navbar, ItemCard
        ├── context/     # AuthContext (global auth state)
        ├── pages/       # Home, Login, Register, Dashboard, etc.
        └── App.js       # Routes
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)
- Git

---

### 1. Clone / Extract the project

```bash
cd neighborhood-exchange
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/neighborhood_exchange
JWT_SECRET=replace_with_a_strong_random_secret
NODE_ENV=development
```

Create the uploads folder:
```bash
mkdir uploads
```

Start the backend:
```bash
npm run dev     # with nodemon (auto-reload)
# or
npm start       # production
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies  
npm install

# Start React dev server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Key Features

- **User Auth** — Register, Login, JWT-protected routes
- **Item Listing** — Add items with photo, category, condition
- **Browse & Search** — Filter by category, search by name
- **Borrow Requests** — Send request → Owner approves/rejects → Mark returned
- **Real-time Chat** — Socket.io powered messaging between users
- **Dashboard** — Manage your listed items
- **Availability Tracking** — Items auto-update when borrowed/returned

---

## 📡 API Endpoints

### Auth
| Method | Route              | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/register | Register user      |
| POST   | /api/auth/login    | Login              |
| GET    | /api/auth/me       | Get current user   |

### Items
| Method | Route           | Description             |
|--------|-----------------|-------------------------|
| GET    | /api/items      | Browse all items        |
| GET    | /api/items/my   | My listed items         |
| GET    | /api/items/:id  | Single item detail      |
| POST   | /api/items      | Create item (+ image)   |
| PUT    | /api/items/:id  | Update item             |
| DELETE | /api/items/:id  | Delete item             |

### Requests
| Method | Route                      | Description           |
|--------|----------------------------|-----------------------|
| POST   | /api/requests              | Send borrow request   |
| GET    | /api/requests/received     | Requests I received   |
| GET    | /api/requests/sent         | Requests I sent       |
| PUT    | /api/requests/:id/status   | Approve/Reject/Return |

### Messages
| Method | Route                | Description               |
|--------|----------------------|---------------------------|
| GET    | /api/messages        | All conversations          |
| GET    | /api/messages/:uid   | Chat with a user           |
| POST   | /api/messages        | Send a message             |

---

## 🗄️ Database Collections

- **users** — name, email, password (hashed), location, profileImage
- **items** — title, description, category, ownerId, availabilityStatus, image
- **borrowrequests** — itemId, borrowerId, ownerId, status, message, dates
- **messages** — senderId, receiverId, message, timestamp

---

## 🔌 Socket.io Events

| Event          | Direction        | Description                    |
|----------------|------------------|--------------------------------|
| `join`         | Client → Server  | Register user socket           |
| `sendMessage`  | Client → Server  | Send a chat message            |
| `receiveMessage` | Server → Client | Receive a chat message        |
| `onlineUsers`  | Server → Client  | List of online user IDs        |

---

## 🌱 Optional Enhancements (from spec)

- [ ] Rating & Review system
- [ ] Geo-location based filtering
- [ ] Email/SMS notifications
- [ ] Cloudinary image upload
- [ ] Admin dashboard
- [ ] AI-based item recommendations

---

## 👩‍💻 Learning Outcomes

After building this project you will have practised:
- Full-stack MERN development
- REST API design with Express
- JWT authentication & bcrypt password hashing
- MongoDB schema design with Mongoose
- Real-time communication with Socket.io
- React context, hooks, and client-side routing
- File uploads with Multer
- CRUD operations end-to-end
