const net = require('net');

const PORT = 3000; // You can change this port if needed

let clients = [];
let userCount = 1;

const server = net.createServer((socket) => {
    // Assign a unique username
    const username = `User${userCount++}`;
    socket.username = username;
    clients.push(socket);
    socket.write(`Welcome to the chatroom, ${username}!\n`);

    // Notify others of new user
    for (let client of clients) {
        if (client !== socket) {
            try {
                client.write(`[Server]: ${username} has joined the chat.\n`);
            } catch (e) { /* Ignore errors here */ }
        }
    }

    socket.on('data', (data) => {
        const message = data.toString().trim();
        if (!message) return; // Ignore empty messages
        // Broadcast to all clients except sender, with username
        for (let client of clients) {
            if (client !== socket) {
                try {
                    client.write(`[${username}]: ${message}\n`);
                } catch (e) {
                    // Remove client if error occurs
                    clients = clients.filter(c => c !== client);
                    try { client.destroy(); } catch {}
                }
            }
        }
    });

    socket.on('end', () => {
        clients = clients.filter(c => c !== socket);
        // Notify others of user leaving
        for (let client of clients) {
            try {
                client.write(`[Server]: ${username} has left the chat.\n`);
            } catch (e) { /* Ignore errors here */ }
        }
    });

    socket.on('error', (err) => {
        clients = clients.filter(c => c !== socket);
        // Notify others of user leaving
        for (let client of clients) {
            try {
                client.write(`[Server]: ${username} has left the chat.\n`);
            } catch (e) { /* Ignore errors here */ }
        }
    });
});

// Graceful shutdown
function shutdown() {
    console.log('\nShutting down server...');
    for (let client of clients) {
        try {
            client.write('[Server]: Server is shutting down. Goodbye!\n');
            client.end();
        } catch (e) { /* Ignore errors */ }
    }
    server.close(() => {
        process.exit(0);
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, () => {
    console.log(`Chat server started on port ${PORT}`);
});
