// Socket.io Live Chat Handler
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

module.exports = (io) => {
  // Store connected users
  const connectedUsers = new Map();
  const adminSockets = new Set();

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Authenticate user
    socket.on('authenticate', async (data) => {
      try {
        const { token, userId, isAdmin } = data;
        
        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        // Store user info
        connectedUsers.set(socket.id, {
          userId: user._id,
          name: `${user.firstName} ${user.lastName}`,
          isAdmin: isAdmin || user.role === 'admin',
          socketId: socket.id
        });

        // Track admin sockets separately
        if (isAdmin || user.role === 'admin') {
          adminSockets.add(socket.id);
          socket.join('admin-room');
          socket.emit('authenticated', { role: 'admin', name: user.fullName });
        } else {
          socket.join('user-room');
          socket.emit('authenticated', { role: 'user', name: user.fullName });
        }

        // Send online status
        socket.broadcast.emit('user-online', { 
          name: user.fullName, 
          isAdmin: isAdmin || user.role === 'admin' 
        });

        // Load chat history
        const history = await ChatMessage.find()
          .sort({ createdAt: -1 })
          .limit(50)
          .populate('sender', 'firstName lastName role');
        
        socket.emit('chat-history', history.reverse());

      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // Handle chat messages
    socket.on('send-message', async (data) => {
      try {
        const user = connectedUsers.get(socket.id);
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { message, type = 'text' } = data;

        // Save message to database
        const chatMessage = await ChatMessage.create({
          sender: user.userId,
          message: message,
          type: type,
          room: user.isAdmin ? 'admin-room' : 'user-room'
        });

        // Populate sender info
        await chatMessage.populate('sender', 'firstName lastName role');

        // Broadcast to appropriate room
        const messageData = {
          id: chatMessage._id,
          sender: {
            id: user.userId,
            name: user.name,
            isAdmin: user.isAdmin
          },
          message: message,
          type: type,
          timestamp: chatMessage.createdAt
        };

        if (user.isAdmin) {
          // Admin message - broadcast to all users
          io.to('user-room').emit('new-message', messageData);
          io.to('admin-room').emit('new-message', messageData);
        } else {
          // User message - send to admins and user
          io.to('admin-room').emit('new-message', messageData);
          socket.emit('new-message', messageData);
        }

        // Notify admins of new user message
        if (!user.isAdmin) {
          io.to('admin-room').emit('user-message-notification', {
            user: user.name,
            preview: message.substring(0, 50)
          });
        }

      } catch (error) {
        console.error('Message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing-start', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit('user-typing', { 
          name: user.name, 
          isTyping: true 
        });
      }
    });

    socket.on('typing-stop', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit('user-typing', { 
          name: user.name, 
          isTyping: false 
        });
      }
    });

    // Request live agent
    socket.on('request-agent', async () => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      // Notify all admins
      io.to('admin-room').emit('agent-request', {
        userId: user.userId,
        userName: user.name,
        socketId: socket.id
      });

      socket.emit('agent-requested', { 
        message: 'An agent will be with you shortly...' 
      });
    });

    // Agent accepts chat
    socket.on('accept-chat', (data) => {
      const agent = connectedUsers.get(socket.id);
      if (!agent || !agent.isAdmin) return;

      const { userSocketId } = data;
      const userSocket = io.sockets.sockets.get(userSocketId);
      
      if (userSocket) {
        userSocket.emit('agent-assigned', {
          agentName: agent.name,
          message: `${agent.name} has joined the chat`
        });
        
        socket.emit('chat-accepted', {
          userName: connectedUsers.get(userSocketId)?.name
        });
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`👋 User disconnected: ${user.name}`);
        
        socket.broadcast.emit('user-offline', { 
          name: user.name, 
          isAdmin: user.isAdmin 
        });
        
        connectedUsers.delete(socket.id);
        adminSockets.delete(socket.id);
      }
    });
  });

  // Get online users count
  io.getOnlineUsers = () => ({
    total: connectedUsers.size,
    admins: adminSockets.size,
    users: connectedUsers.size - adminSockets.size
  });
};
