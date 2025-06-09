const net = require('net');

// Configuration: Default port if not set in environment variables
const PORT = process.env.PORT || 3000;
// Maximum number of clients to prevent resource exhaustion
const MAX_CLIENTS = 100;
// Array to store connected client sockets
let clients = [];
// Counter for assigning unique usernames
let userCount = 1;

// Create TCP server to handle client connections
const server = net.createServer((socket) => {
    // Check if maximum client limit is reached
    if (clients.length >= MAX_CLIENTS) {
        socket.write('[Server]: Chatroom is full. Please try again later.\n');
        socket.destroy();
        return;
    }

    // Assign a unique username to the client
    const username = `User${userCount++}`;
    socket.username = username;
    clients.push(socket);
    // Send welcome message to the new client
    socket.write(`Welcome to the chatroom, ${username}!\n`);

    // Notify all other clients of the new user
    broadcast(socket, `[Server]: ${username} has joined the chat.\n`);

    // Handle incoming data from the client
    socket.on('data', (data) => {
        let message;
        try {
            // Attempt to decode data as UTF-8 and trim whitespace
            message = data.toString('utf8').trim();
        } catch (e) {
            // Handle invalid UTF-8 data
            console.error(`Invalid data from ${username}: ${e.message}`);
            return;
        }
        if (!message) return; // Ignore empty messages
        // Broadcast the message to all clients except the sender
        broadcast(socket, `[${username}]: ${message}\n`);
    });

    // Handle client disconnection
    socket.on('end', () => {
        // Remove client from the list
        clients = clients.filter(c => c !== socket);
        // Notify others of the disconnection
        broadcast(socket, `[Server]: ${username} has left the chat.\n`);
    });

    // Handle client errors (e.g., abrupt disconnection)
    socket.on('error', (err) => {
        console.error(`Error with ${username}: ${err.message}`);
        // Remove client from the list (avoid duplicate notification with 'end')
        clients = clients.filter(c => c !== socket);
        broadcast(socket, `[Server]: ${username} has left the chat.\n`);
    });
});

// Broadcast a message to all clients except the sender
function broadcast(sender, message) {
    for (let client of clients) {
        if (client !== sender && client.writable) {
            try {
                client.write(message);
            } catch (e) {
                // Remove client if write fails
                console.error(`Broadcast error to client: ${e.message}`);
                clients = clients.filter(c => c !== client);
                try { client.destroy(); } catch {}
            }
        }
    }
}

// Handle graceful server shutdown
function shutdown() {
    console.log('\nShutting down server...');
    // Notify all clients of shutdown
    for (let client of clients) {
        try {
            client.write('[Server]: Server is shutting down. Goodbye!\n');
            client.end();
        } catch (e) {
            console.error(`Error during shutdown: ${e.message}`);
        }
    }
    // Close the server and exit
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
}

// Register shutdown handlers for SIGINT (Ctrl+C) and SIGTERM
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
server.listen(PORT, () => {
    console.log(`Chat server started on port ${PORT}`);
});

// Handle server errors (e.g., port already in use)
server.on('error', (err) => {
    console.error(`Server error: ${err.message}`);
    process.exit(1);
});