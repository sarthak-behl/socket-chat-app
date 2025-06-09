const net = require('net');
const readline = require('readline');

// Configuration: Server host and port
const PORT = 3000; // Must match server port
const HOST = '127.0.0.1'; // Change to server IP if needed
const MAX_MSG_LENGTH = 256; // Maximum message length
const RECONNECT_DELAY = 1000; // Initial reconnect delay (ms)
const MAX_RECONNECT_ATTEMPTS = 5; // Maximum reconnection attempts

// Validate host and port
if (!HOST.match(/^(?:\d{1,3}\.){3}\d{1,3}$|^localhost$/)) {
    console.error('Invalid HOST: Must be an IP address or localhost');
    process.exit(1);
}
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    console.error('Invalid PORT: Must be between 1 and 65535');
    process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

// Function to attempt connection to the server
let client;
let reconnectAttempts = 0;
function connect() {
    client = net.createConnection({ port: PORT, host: HOST }, () => {
        console.log('Connected to chat server.');
        reconnectAttempts = 0; // Reset reconnect attempts on success
    });

    // Handle incoming data from the server
    client.on('data', (data) => {
        let msg;
        try {
            // Attempt to decode data as UTF-8
            msg = data.toString('utf8');
        } catch (e) {
            console.error('Received invalid data from server');
            return;
        }
        process.stdout.write(msg);
        if (msg.includes('Server is shutting down') || msg.includes('Chatroom is full')) {
            cleanup();
        }
    });

    // Handle server disconnection
    client.on('end', () => {
        console.log('\nDisconnected from server.');
        attemptReconnect();
    });

    // Handle connection errors
    client.on('error', (err) => {
        console.error(`Connection error: ${err.message}`);
        attemptReconnect();
    });
}

// Attempt to reconnect with exponential backoff
function attemptReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached. Exiting.');
        cleanup();
        return;
    }
    reconnectAttempts++;
    const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
    console.log(`Reconnecting in ${delay}ms... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    setTimeout(connect, delay);
}

// Handle user input
rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return; // Ignore empty messages
    if (trimmed.length > MAX_MSG_LENGTH) {
        console.log(`Message too long (max ${MAX_MSG_LENGTH} characters).`);
        return;
    }
    if (client && client.writable) {
        try {
            client.write(trimmed + '\n');
        } catch (e) {
            console.error('Failed to send message:', e.message);
        }
    } else {
        console.log('Not connected to server. Reconnecting...');
        attemptReconnect();
    }
});

// Clean up resources on exit
function cleanup() {
    if (client) {
        try {
            client.end();
        } catch {}
    }
    rl.close();
    process.exit(0);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the client
connect();