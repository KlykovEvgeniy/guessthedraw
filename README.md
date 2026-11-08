# 🎨 GuessTheDraw

A real-time multiplayer drawing and guessing game (similar to Pictionary or Skribbl.io).

## ✨ Features

- **Real-Time Drawing:** Interactive canvas with color selection and brush size controls.
- **Game Rooms:** Create private or public lobbies to play with friends.
- **Live Chat & Word Guessing:** Instant answer verification and score tracking.
- **[Add other features, e.g., custom word lists, round timer, leaderboard]**

---

## 🛠 Tech Stack

### Client (`client/`)
- **[e.g., React / Vue / Next.js / TypeScript]**
- **[e.g., HTML5 Canvas / Tailwind CSS]**
- **[e.g., Socket.IO Client]**

### Server (`server/`)
- **[e.g., Node.js / Express]**
- **[e.g., Socket.IO / WebSockets]**
- **[e.g., Database or state store, e.g., Redis]**

---

## 📁 Project Structure

```text
guessthedraw/
├── client/          # Frontend application
├── server/          # Backend and WebSocket server logic
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com
cd guessthedraw
```

### 2. Start the server
```bash
cd server
npm install
# Create a .env file if required (see .env.example)
npm run dev
```

### 3. Start the client
Open a new terminal window:
```bash
cd client
npm install
# Create a .env file if required (e.g., VITE_SERVER_URL)
npm run dev
```

Once running, the application will be available at `http://localhost:3000` (or `http://localhost:5173`, depending on your bundler).
