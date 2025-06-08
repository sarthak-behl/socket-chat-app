const net = require('net');
const readline = require('readline');

const PORT = 3000; // Must match server port
const HOST = '127.0.0.1'; // Change to server IP if needed

const MAX_MSG_LENGTH = 256;

const client = net.createConnection({ port: PORT, host: HOST }, () => {
    console.log('Connected to chat server.');
});

client.on('data', (data) => {
    const msg = data.toString();
    process.stdout.write(msg);
    if (msg.includes('Server is shutting down')) {
        process.exit(0);
    }
});

client.on('end', () => {
    console.log('\nDisconnected from server.');
    process.exit(0);
});

client.on('error', (err) => {
    console.error('Connection error:', err.message);
    process.exit(1);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return; // Ignore empty messages
    if (trimmed.length > MAX_MSG_LENGTH) {
        console.log(`Message too long (max ${MAX_MSG_LENGTH} characters).`);
        return;
    }
    client.write(trimmed + '\n');
});
