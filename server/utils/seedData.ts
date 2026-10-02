import bcrypt from 'bcryptjs';
import { loadStore, saveStore } from '../config/db.ts';

export async function seedInitialData() {
  const store = loadStore();
  if (store.users && store.users.length > 0) {
    return; // Already initialized
  }

  console.log('🌱 Seeding initial college demo data for NEXUS platform...');

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const now = new Date();
  const pastTime = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

  const userAlex = {
    _id: '65f1a011a011a011a0110001',
    name: 'Alex River',
    username: 'alexriver',
    email: 'alex@nexus.social',
    password: passwordHash,
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'Software Architect & Full-Stack Engineer. Building scalable systems, distributed backends & modern web apps. ☕🚀',
    followers: ['65f1a011a011a011a0110002', '65f1a011a011a011a0110003', '65f1a011a011a011a0110004'],
    following: ['65f1a011a011a011a0110002', '65f1a011a011a011a0110003'],
    createdAt: pastTime(10080),
    updatedAt: pastTime(10080),
  };

  const userMaya = {
    _id: '65f1a011a011a011a0110002',
    name: 'Maya Chen',
    username: 'mayachen',
    email: 'maya@nexus.social',
    password: passwordHash,
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    bio: 'AI researcher & robotics enthusiast. Deep learning, computer vision, and neural network interpretability. ✨🤖',
    followers: ['65f1a011a011a011a0110001', '65f1a011a011a011a0110003'],
    following: ['65f1a011a011a011a0110001', '65f1a011a011a011a0110004'],
    createdAt: pastTime(9000),
    updatedAt: pastTime(9000),
  };

  const userMarcus = {
    _id: '65f1a011a011a011a0110003',
    name: 'Marcus Vance',
    username: 'marcusv',
    email: 'marcus@nexus.social',
    password: passwordHash,
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Creative dev & 3D WebGL animator. Shaders, interactive experiences & generative art. 🎨🕹️',
    followers: ['65f1a011a011a011a0110001'],
    following: ['65f1a011a011a011a0110001', '65f1a011a011a011a0110002'],
    createdAt: pastTime(8500),
    updatedAt: pastTime(8500),
  };

  const userSophia = {
    _id: '65f1a011a011a011a0110004',
    name: 'Sophia Ray',
    username: 'sophiaray',
    email: 'sophia@nexus.social',
    password: passwordHash,
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    bio: 'Tech founder & Open-Source advocate. Passionate about privacy, cryptography and community-driven technology. 🌐💡',
    followers: ['65f1a011a011a011a0110002'],
    following: ['65f1a011a011a011a0110001'],
    createdAt: pastTime(8000),
    updatedAt: pastTime(8000),
  };

  const posts = [
    {
      _id: '65f1b022b022b022b0220001',
      author: userAlex._id,
      caption: 'Thrilled to unveil our major college engineering project — NEXUS! Built from the ground up with the MERN stack (MongoDB, Express, React, Node.js) and real-time Socket.io websockets. Check out our high-throughput feeds and instant chat engine! 🚀⚡',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      hashtags: ['MERN', 'WebDev', 'CollegeProject', 'Architecture', 'SocketIO'],
      likes: [userMaya._id, userMarcus._id, userSophia._id],
      createdAt: pastTime(120),
      updatedAt: pastTime(120),
    },
    {
      _id: '65f1b022b022b022b0220002',
      author: userMaya._id,
      caption: 'Benchmarking state-of-the-art vision models today. The latency on edge devices dropped by 42% after quantization. Here is the lab workspace for the afternoon! 🔬💻',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      hashtags: ['AI', 'Robotics', 'MachineLearning', 'TechLife'],
      likes: [userAlex._id, userMarcus._id],
      createdAt: pastTime(360),
      updatedAt: pastTime(360),
    },
    {
      _id: '65f1b022b022b022b0220003',
      author: userMarcus._id,
      caption: 'Experimenting with fluid raymarching simulations and custom WebGL shaders. The volumetric lighting is finally hitting 60fps smoothly! 🎨✨',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      hashtags: ['WebGL', 'CreativeCoding', 'ThreeJS', 'Design'],
      likes: [userAlex._id, userSophia._id],
      createdAt: pastTime(720),
      updatedAt: pastTime(720),
    },
    {
      _id: '65f1b022b022b022b0220004',
      author: userSophia._id,
      caption: '“The best way to predict the future is to invent it.” Morning coffee thoughts on decentralization, open systems, and user privacy in modern social media. ☕📖',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
      hashtags: ['OpenSource', 'Privacy', 'Innovation', 'Future'],
      likes: [userAlex._id, userMaya._id],
      createdAt: pastTime(1440),
      updatedAt: pastTime(1440),
    }
  ];

  const comments = [
    {
      _id: '65f1c033c033c033c0330001',
      post: posts[0]._id,
      author: userMaya._id,
      content: 'Incredible work on the full-stack architecture Alex! The real-time Socket.io responsiveness is buttery smooth.',
      createdAt: pastTime(90),
      updatedAt: pastTime(90),
    },
    {
      _id: '65f1c033c033c033c0330002',
      post: posts[0]._id,
      author: userMarcus._id,
      content: 'The UI layout and dark mode accents look very modern. Major project demo is going to be stellar!',
      createdAt: pastTime(60),
      updatedAt: pastTime(60),
    },
    {
      _id: '65f1c033c033c033c0330003',
      post: posts[1]._id,
      author: userAlex._id,
      content: '42% latency reduction is huge Maya! Did you use INT8 quantization or FP16 tensor cores?',
      createdAt: pastTime(300),
      updatedAt: pastTime(300),
    },
  ];

  const conversation1 = {
    _id: '65f1d044d044d044d0440001',
    participants: [userAlex._id, userMaya._id],
    lastMessage: {
      content: 'Hey Alex! Did you verify the JWT token expiry and Socket.io reconnection handling?',
      sender: userMaya._id,
      createdAt: pastTime(15),
    },
    createdAt: pastTime(1200),
    updatedAt: pastTime(15),
  };

  const messages = [
    {
      _id: '65f1e055e055e055e0550001',
      conversation: conversation1._id,
      sender: userAlex._id,
      receiver: userMaya._id,
      content: 'Hey Maya! Welcome to NEXUS! The socket connection is listening on port 3000.',
      read: true,
      createdAt: pastTime(30),
    },
    {
      _id: '65f1e055e055e055e0550002',
      conversation: conversation1._id,
      sender: userMaya._id,
      receiver: userAlex._id,
      content: 'Hey Alex! Did you verify the JWT token expiry and Socket.io reconnection handling?',
      read: false,
      createdAt: pastTime(15),
    }
  ];

  const notifications = [
    {
      _id: '65f1f066f066f066f0660001',
      recipient: userAlex._id,
      sender: userMaya._id,
      type: 'like',
      post: posts[0]._id,
      read: false,
      createdAt: pastTime(95),
    },
    {
      _id: '65f1f066f066f066f0660002',
      recipient: userAlex._id,
      sender: userMaya._id,
      type: 'comment',
      post: posts[0]._id,
      read: false,
      createdAt: pastTime(90),
    },
    {
      _id: '65f1f066f066f066f0660003',
      recipient: userAlex._id,
      sender: userSophia._id,
      type: 'follow',
      read: true,
      createdAt: pastTime(400),
    },
  ];

  store.users = [userAlex, userMaya, userMarcus, userSophia];
  store.posts = posts;
  store.comments = comments;
  store.conversations = [conversation1];
  store.messages = messages;
  store.notifications = notifications;

  saveStore(store);
  console.log('✅ Demo seed data successfully initialized.');
}
