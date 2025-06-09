Node.js Socket Chat Application
Overview
This is a real-time chat application built using Node.js's built-in net module. The server supports multiple concurrent clients, allowing users to send and receive messages in a shared chatroom environment. The application uses TCP sockets for communication and handles concurrency via Node.js's event-driven, non-blocking I/O model.


Features

Multiple clients can connect and chat simultaneously.
Messages are broadcast to all connected clients except the sender, prefixed with the sender's username.
Simple text-based interface for sending and receiving messages.
Unique usernames assigned to clients (e.g., User1, User2).
Notifications for users joining or leaving the chatroom.
Graceful server shutdown with client notifications.
Client reconnection logic with exponential backoff.
Error handling for invalid messages, client limits, and network issues.

Prerequisites

Node.js version 14 or higher.
Git (for cloning the repository).

How to Run Locally
1. Clone the Repository
git clone https://github.com/sarthak-behl/socket-chat-app
cd chat-app

2. Start the Server
Open a terminal and run:
node server.js

The server listens on port 3000 by default (configurable via the PORT environment variable).
3. Start a Client
Open a new terminal for each client and run:
node client.js

The client connects to 127.0.0.1:3000 by default. To connect to a remote server, edit client.js to update the HOST and PORT variables.

4. Using the Chat

Type messages in any client terminal and press Enter.
Messages are broadcast to all other clients in real-time.
Press Ctrl+C to exit a client or the server gracefully.


Repository Link: (https://github.com/sarthak-behl/socket-chat-app)


Architecture

Server (server.js):

Uses the net module to create a TCP server.
Maintains a clients array to track connected sockets.
Assigns unique usernames (User1, User2, etc.).
Broadcasts messages to all clients except the sender using a dedicated broadcast function.
Handles client disconnections and errors, removing failed clients from the list.
Supports graceful shutdown with SIGINT and SIGTERM handlers.


Client (client.js):

Uses the net module to connect to the server via TCP.
Employs the readline module for a text-based interface to send/receive messages.
Implements reconnection logic with exponential backoff (up to 5 attempts).
Validates input (e.g., message length, host/port) and handles server shutdown.



Concurrency Handling

The server uses Node.js's event-driven, non-blocking I/O model (event loop) to handle multiple clients concurrently.
Each client connection triggers events (data, end, error) processed asynchronously.
No threads are used; concurrency is achieved via the event loop, ensuring scalability for multiple clients.
A maximum client limit (100) prevents resource exhaustion.

Error Handling and Edge Cases

Server:

Ignores empty messages to prevent unnecessary broadcasts.
Validates message encoding to handle invalid UTF-8 data.
Removes failed clients (e.g., write errors) and destroys their sockets.
Enforces a maximum client limit to prevent overload.
Handles server errors (e.g., port in use) with graceful exit.


Client:

Validates HOST and PORT inputs to ensure valid connection parameters.
Limits message length to 256 characters.
Handles invalid server responses (e.g., non-UTF-8 data).
Implements reconnection with exponential backoff (1s, 2s, 4s, 8s, 16s) for up to 5 attempts.
Gracefully exits on server shutdown or connection failure.



Assumptions & Design Choices

Uses only standard Node.js modules (net, readline) to meet the no-external-libraries constraint.
Communicates over TCP sockets for reliable, ordered message delivery.
Assigns simple incremental usernames (User1, User2) for identification.
Broadcasts raw messages with username prefixes for clarity.
Default port is 3000, configurable via environment variables.
Client reconnection logic assumes temporary server unavailability (e.g., restarts).
Maximum client limit (100) balances performance and usability.

Accessing the Chat Application

Start the server (node server.js).
Start one or more clients (node client.js) in separate terminals.
Type messages in any client terminal; they appear in all other clients in real-time.
For remote access, deploy the server and update client.js with the deployed HOST and PORT.

Troubleshooting

Port in use: Ensure no other process is using port 3000 or set a different PORT in server.js.
Connection refused: Verify the server is running and the HOST/PORT in client.js match the server.
Invalid messages: Non-UTF-8 data is ignored, and clients are notified of message length limits.
Reconnection failures: Check network stability or server availability; max 5 reconnect attempts.

