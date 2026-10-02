# NEXUS: Full-Stack Social Media Platform
## Major College Engineering Project Overview Document

---

### Executive Summary
**NEXUS** is an end-to-end full-stack social media application developed as a major academic project. It embodies the core tenets of modern web engineering:
- Scalable separation of concerns with the MERN stack.
- Cryptographically sound authentication and access control.
- Event-driven WebSocket architectures for sub-second communication.
- Responsive design tailored for desktops, tablets, and smartphones.

---

### Technical Highlights & Engineering Decisions

#### 1. Real-Time WebSocket Layer
Unlike static web mockups that simulate messaging with `setTimeout`, NEXUS integrates a server-authoritative **Socket.io** server listening on the same port (3000) as the Express application.
- Clients register upon login, binding their authenticated `userId` to their active socket instance.
- Chat rooms are dynamically managed via `conv_{conversationId}` rooms.
- Real-time events include typing indicators, presence awareness (online/offline indicators), read receipts, and instantaneous message delivery.
- Every chat message is validated and persisted into MongoDB before broadcast, guaranteeing that history is intact across page reloads.

#### 2. Dual-Engine Mongoose & Storage Persistence
- Connects directly to **MongoDB Atlas** or local MongoDB instance when `MONGODB_URI` is provided.
- If an external MongoDB daemon is not running in the evaluation environment, a high-performance file-persisted JSON document store (`server/data/nexus_db.json`) engages automatically with zero downtime.
- This guarantees that evaluators can run the project immediately with zero configuration headaches while having full data persistence.

#### 3. Security & Access Control
- **Password Protection**: Passwords are never stored in plain text; they are hashed using `bcryptjs` with salt rounds.
- **Stateless Tokens**: Authentication uses industry-standard JSON Web Tokens (`jsonwebtoken`) with a 30-day expiration window.
- **Authorization Guard**: The Express middleware `protect` verifies bearer tokens, extracts user IDs, and rejects unauthorized access with HTTP 401.
- **Resource Ownership**: Only post owners can edit or delete their own posts; comment deletion verifies author or post author rights.

#### 4. RESTful API Design & Postman Compliance
- Conforms strictly to standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- Returns structured JSON responses and semantic HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Server Error`).
- Offers an exportable Postman Collection v2.1 accessible via `/api/docs/postman`.

---

### Key Modules
1. **Authentication Module**: Secure register, login, session validation, logout.
2. **User Profile Module**: Profile page, avatar picker, bio editor, follower/following management.
3. **Social Feed & Post Module**: Feed aggregation, post creator, photo previews, hashtag parser, likes.
4. **Discussion & Comment Module**: Threaded comments, deletion, realtime counter synchronization.
5. **Real-Time Chat Module**: One-on-one instant messaging, typing indicators, active presence.
6. **Activity & Notification Module**: In-app notifications for likes, follows, comments, and messages.
7. **Developer & Evaluator Suite**: Interactive Postman API tester, system health monitor, JWT exporter.
