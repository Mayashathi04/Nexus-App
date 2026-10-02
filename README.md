# NEXUS – Full-Stack Social Media Platform

> **Major College Engineering Project**  
> Built with the **MERN Stack** (MongoDB, Express.js, React, Node.js) and **Socket.io** WebSockets.

---

## 1. Project Overview & Objectives

**NEXUS** is an enterprise-grade full-stack social media application engineered from the ground up for collaborative discussions, technical updates, research findings, and real-time interaction. It was developed to demonstrate end-to-end full-stack software engineering principles, secure identity management, real-time bi-directional messaging, and scalable database schema design.

### Core Objectives
1. **Secure Identity & Authentication**: User registration with bcrypt password hashing and stateless JSON Web Token (JWT) bearer authentication.
2. **Social Interaction Engine**: High-throughput social feed, dynamic post creation with photographs and hashtag indexing, atomic like/unlike operations, and threaded comment sections.
3. **Follow & Social Graph**: User relationship graph with follower and following counters, mutual discovery, and profile management.
4. **Real-Time Communication**: Persistent one-on-one messaging powered by Socket.io, real-time online/offline presence tracking, and typing indicators.
5. **Interactive Evaluation Suite**: Pre-configured Postman collection (v2.1) download and an in-app interactive REST API explorer for evaluation and testing.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Axios, Context API, Lucide Icons, Motion |
| **Backend** | Node.js, Express.js, REST API Architecture, Socket.io |
| **Database** | MongoDB Atlas / Local MongoDB, Mongoose ODM (with seamless document fallback) |
| **Security** | JWT (jsonwebtoken), bcryptjs, CORS, input sanitization |
| **Testing** | Postman Collection v2.1, In-App Live API Explorer |

---

## 3. System Architecture

```
[ Client: React SPA / Mobile Web ]
                │
         HTTP REST APIs (Axios)
         WebSocket Events (Socket.io)
                ▼
[ Node.js + Express.js Server (Port 3000) ]
        │                       │
 ┌──────┴──────┐         ┌──────┴──────┐
 │ Controllers │         │  Socket.io  │
 │  & Routes   │         │ Presence &  │
 │  (REST API) │         │  Chat Rooms │
 └──────┬──────┘         └──────┬──────┘
        │                       │
        ▼                       ▼
[ Middleware: JWT Protect & Input Validation ]
                        │
                        ▼
         [ Models: Mongoose / Storage Layer ]
        ┌───────────────────────────────────┐
        │ Users, Posts, Comments,           │
        │ Conversations, Messages, Notifs   │
        └─────────────────┬─────────────────┘
                          │
                          ▼
            [ MongoDB Database / Storage ]
```

---

## 4. Folder Structure

```
nexus-social-platform/
│
├── server/                           # Backend Server Architecture
│   ├── config/
│   │   └── db.ts                     # MongoDB / Mongoose connection & fallback store
│   ├── controllers/
│   │   ├── authController.ts         # Register, Login, Me, Logout
│   │   ├── userController.ts         # Profiles, Search, Follow/Unfollow
│   │   ├── postController.ts         # CRUD, Feed, Likes/Unlikes
│   │   ├── commentController.ts      # Comment add, list, delete
│   │   ├── conversationController.ts # 1-on-1 Chats, Messages
│   │   └── notificationController.ts # In-app notification alerts
│   ├── middleware/
│   │   ├── authMiddleware.ts         # JWT verification & protection
│   │   └── errorHandler.ts           # 404 & 500 JSON error handling
│   ├── models/
│   │   ├── User.ts                   # User Schema & Methods
│   │   ├── Post.ts                   # Post Schema with Author Populate
│   │   ├── Comment.ts                # Threaded Comment Schema
│   │   ├── Conversation.ts           # Chat Conversation Schema
│   │   ├── Message.ts                # Real-time Message Schema
│   │   └── Notification.ts           # Notification Schema
│   ├── routes/
│   │   ├── authRoutes.ts             # /api/auth/*
│   │   ├── userRoutes.ts             # /api/users/*
│   │   ├── postRoutes.ts             # /api/posts/*
│   │   ├── commentRoutes.ts          # /api/comments/*
│   │   ├── conversationRoutes.ts     # /api/conversations, /api/messages
│   │   ├── notificationRoutes.ts     # /api/notifications/*
│   │   └── docsRoutes.ts             # /api/docs/postman, /api/health
│   ├── socket/
│   │   └── socketHandler.ts          # Socket.io events, rooms, presence
│   └── utils/
│       ├── generateToken.ts          # JWT sign & verify
│       ├── objectId.ts               # MongoDB ObjectId generator
│       └── seedData.ts               # Evaluator demo accounts & feed seed
│
├── src/                              # Frontend Client Architecture
│   ├── components/
│   │   ├── Navbar.tsx                # Brand, search, quick Postman link, avatar
│   │   ├── Sidebar.tsx               # Desktop left navigation & system monitor
│   │   ├── MobileNavbar.tsx          # Mobile bottom navigation
│   │   ├── PostCard.tsx              # Social post with likes, comments, author
│   │   ├── CommentSection.tsx        # Inline comment input & comments list
│   │   ├── CreatePostModal.tsx       # Post composer with image & hashtags
│   │   ├── EditPostModal.tsx         # Post editing modal
│   │   ├── UserCard.tsx              # Profile preview & follow toggle
│   │   ├── FollowListModal.tsx       # Followers/Following dialog
│   │   └── ToastContainer.tsx        # In-app real-time alerts
│   ├── context/
│   │   ├── AuthContext.tsx           # Authentication & user state
│   │   ├── SocketContext.tsx         # Socket.io connection & presence
│   │   └── NotificationContext.tsx   # Live notifications & toasts
│   ├── pages/
│   │   ├── LandingPage.tsx           # Hero, features, 1-click test login
│   │   ├── LoginPage.tsx             # Login form & demo account buttons
│   │   ├── RegisterPage.tsx          # Registration with avatars
│   │   ├── FeedPage.tsx              # Following & Explore social feeds
│   │   ├── ExplorePage.tsx           # User search & hashtag filtering
│   │   ├── ProfilePage.tsx           # User profile, posts, follower counts
│   │   ├── EditProfilePage.tsx       # Profile editor & avatar selector
│   │   ├── NotificationsPage.tsx     # Activity notifications list
│   │   ├── ChatPage.tsx              # Real-Time Socket.io chat window
│   │   ├── SettingsPage.tsx          # Diagnostics & JWT token copier
│   │   └── ApiDocsPage.tsx           # Postman tester & API docs
│   ├── services/
│   │   ├── api.ts                    # Centralized Axios client & helpers
│   │   └── socket.ts                 # Socket.io client connector
│   ├── App.tsx                       # Main router & providers wrapper
│   └── index.css                     # Tailwind CSS & custom scrollbars
│
├── server.ts                         # Unified Express & Socket.io server
├── package.json                      # Dependencies and scripts
└── .env.example                      # Configuration template
```

---

## 5. Database Design & Mongoose Models

### User Schema (`server/models/User.ts`)
- `_id`: ObjectId (String)
- `name`: String (Required)
- `username`: String (Unique, Lowercase, Indexed)
- `email`: String (Unique, Lowercase, Indexed)
- `password`: String (Bcrypt Hash, 10 rounds)
- `profilePicture`: String (URL)
- `bio`: String
- `followers`: Array of User ObjectIds
- `following`: Array of User ObjectIds
- `createdAt`, `updatedAt`: ISO Timestamps

### Post Schema (`server/models/Post.ts`)
- `_id`: ObjectId
- `author`: ObjectId (Ref -> User, Populated with name, username, profilePicture)
- `caption`: String
- `image`: String (URL / base64)
- `hashtags`: Array of Strings
- `likes`: Array of User ObjectIds
- `createdAt`, `updatedAt`: ISO Timestamps

### Comment Schema (`server/models/Comment.ts`)
- `_id`: ObjectId
- `post`: ObjectId (Ref -> Post)
- `author`: ObjectId (Ref -> User)
- `content`: String
- `createdAt`, `updatedAt`: ISO Timestamps

### Conversation Schema (`server/models/Conversation.ts`)
- `_id`: ObjectId
- `participants`: Array of User ObjectIds (Ref -> User)
- `lastMessage`: Object `{ content, sender, createdAt }`
- `createdAt`, `updatedAt`: ISO Timestamps

### Message Schema (`server/models/Message.ts`)
- `_id`: ObjectId
- `conversation`: ObjectId (Ref -> Conversation)
- `sender`: ObjectId (Ref -> User)
- `receiver`: ObjectId (Ref -> User)
- `content`: String
- `read`: Boolean (Default: false)
- `createdAt`: ISO Timestamp

### Notification Schema (`server/models/Notification.ts`)
- `_id`: ObjectId
- `recipient`: ObjectId (Ref -> User)
- `sender`: ObjectId (Ref -> User)
- `type`: Enum `['like', 'comment', 'follow', 'message']`
- `post`: ObjectId (Optional, Ref -> Post)
- `message`: ObjectId (Optional, Ref -> Message)
- `read`: Boolean (Default: false)
- `createdAt`: ISO Timestamp

---

## 6. Real-Time Socket.io Architecture

Socket.io attaches to the HTTP server running on port 3000:

| Event | Direction | Payload | Description |
|---|---|---|---|
| `connection` | Client -> Server | - | Establishes WebSocket transport |
| `registerUser` | Client -> Server | `userId` | Registers active online socket mapping |
| `onlineUsersList` | Server -> Clients | `[userId]` | Broadcasts array of active user IDs |
| `joinConversation` | Client -> Server | `conversationId` | Joins room `conv_{conversationId}` |
| `sendMessage` | Client -> Server | `{ conversationId, receiverId, content, senderId }` | Persists in MongoDB & broadcasts |
| `receiveMessage` | Server -> Room | `Message Object` | Delivers message instantly to chat room |
| `newMessageNotification` | Server -> Receiver | `{ message, conversationId }` | Triggers toast alert for recipient |
| `typing` / `stopTyping` | Client -> Room | `{ conversationId, userId, username }` | Renders animated 3-dot typing indicator |
| `markAsRead` | Client -> Server | `{ conversationId, userId }` | Updates message read status in DB & emits receipt |

---

## 7. Pre-Seeded Evaluator Accounts

For convenience when testing or presenting the project, 4 test accounts are pre-seeded with hashed passwords:

| Name | Username | Email | Password | Role |
|---|---|---|---|---|
| **Alex River** | `@alexriver` | `alex@nexus.social` | `Password123!` | Full-Stack Architect |
| **Maya Chen** | `@mayachen` | `maya@nexus.social` | `Password123!` | AI & Robotics Researcher |
| **Marcus Vance** | `@marcusv` | `marcus@nexus.social` | `Password123!` | Creative WebGL Artist |
| **Sophia Ray** | `@sophiaray` | `sophia@nexus.social` | `Password123!` | Open-Source Founder |

*You can also click any of the 1-click login buttons on the Landing or Login page.*

---

## 8. Postman Testing Guide

1. Navigate to the **Postman & REST API Explorer** in the application (`/apidocs` or click the button in Navbar/Sidebar).
2. Click **Download Postman (.json)** or send a `GET` request to:
   ```
   GET http://localhost:3000/api/docs/postman
   ```
3. Open Postman -> **Import** -> Select `nexus_postman_collection.json`.
4. The collection is configured with environment variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `authToken`: JWT token from `/api/auth/login`
5. Execute requests across the 6 folders:
   - `1. Authentication` (Register, Login, Me, Logout)
   - `2. Users & Profiles` (Search, Get Profile, Update, Follow, Unfollow)
   - `3. Posts & Social Feed` (Get Feed, Create, Update, Delete, Like, Unlike)
   - `4. Comments` (List Comments, Add Comment, Delete)
   - `5. Real-Time Chat` (Get Conversations, Get Messages, Send Message)
   - `6. Notifications` (Get Notifications, Mark All Read)

---

## 9. Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI or local MongoDB daemon (Optional: the built-in document store activates automatically if MongoDB is not running locally).

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server (Port 3000)
npm run dev

# 4. Open in browser
http://localhost:3000
```
