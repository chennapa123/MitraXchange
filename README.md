# 🏘️ MitraXchange — Neighborhood Resource Exchange Platform

A full-stack MERN web application that lets neighbors share household items — borrow a drill, lend a book, build community.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, CSS      |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT + bcryptjs + Google OAuth 2.0   |
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
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
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

# Create your .env file
touch .env
```

Edit `frontend/.env` and add your Google Client ID:
```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

> **Get Google Client ID:** Follow the [Google OAuth Quick Start Guide](./GOOGLE_OAUTH_QUICKSTART.md)

Start React dev server:
```bash
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Key Features

- **User Auth** — Register/Login with email & password, or **Google OAuth**
- **Form Validation** — Real-time email, password, and name validation
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
| POST   | /api/auth/google   | Google OAuth login |
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

## 🔐 Google OAuth Setup

NeighborShare supports **Google OAuth 2.0** for quick and secure authentication.

### Quick Setup (5 minutes)

1. **Get Google Client ID** from [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project → APIs & Services → Credentials
   - Create OAuth 2.0 Web Application credentials
   - Add redirect URI: `http://localhost:3000`

2. **Update environment variables:**
   - `frontend/.env`: Add `REACT_APP_GOOGLE_CLIENT_ID=your_client_id`
   - `backend/.env`: Add `GOOGLE_CLIENT_ID=your_client_id`

3. **Restart both servers** and you're done!

**See [GOOGLE_OAUTH_QUICKSTART.md](./GOOGLE_OAUTH_QUICKSTART.md) for detailed instructions.**

### Features
- One-click sign-up and sign-in
- Automatic user account creation
- Profile image sync from Google
- Existing users can sign in via Google

---

## ✅ Form Validation

Both **Register** and **Login** pages include comprehensive client-side validation:

### Registration
- **Name**: 2-50 characters, letters/spaces/hyphens/apostrophes only
- **Email**: Valid email format required
- **Password**: Min 6 characters, uppercase, lowercase, and numbers
- **Confirm Password**: Must match password
- **Real-time error messages** as you type

### Login
- **Email**: Valid email format required
- **Password**: Required and checked for minimum length
- **Clear error feedback** on failed attempts

---

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
