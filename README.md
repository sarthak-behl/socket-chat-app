# Node.js Socket Chat Application

## Overview

This is a simple real-time chat application using Node.js's built-in `net` module. The server supports multiple concurrent clients, allowing users to send and receive messages in a shared chatroom environment.

## Features

- Multiple clients can connect and chat simultaneously.
- Messages are broadcast to all connected clients except the sender.
- Simple text-based interface for sending and receiving messages.

## How to Run

### 1. Start the Server

Open a terminal and run:

```
node server.js
```

The server will start listening on port 3000 (default).

### 2. Start a Client

Open another terminal for each client and run:

```
node client.js
```

By default, the client connects to `127.0.0.1:3000`. To connect to a remote server, change the `HOST` variable in `client.js`.

## Architecture

- **Server (`server.js`)**: Uses Node.js's `net` module to accept TCP connections. Maintains a list of connected clients and broadcasts incoming messages to all clients except the sender.
- **Client (`client.js`)**: Connects to the server using TCP. Uses the `readline` module for user input and displays messages from the server in real-time.

## Concurrency Handling

- The server handles multiple clients asynchronously using Node.js's event-driven, non-blocking I/O model. Each client connection is managed via events (`data`, `end`, `error`).
- No threads are used; concurrency is achieved through Node.js's event loop.

## Assumptions & Design Choices

- Only standard Node.js modules are used (`net`, `readline`).
- The server broadcasts raw messages as received; no user identification or message formatting is implemented.
- The client and server communicate over TCP sockets.
- The server listens on port 3000 by default; you can change this in the source code.

## Accessing the Chat Application

1. Start the server.
2. Start one or more clients (each in a separate terminal).
3. Type messages in any client window; messages will appear in all other clients in real-time.

---
