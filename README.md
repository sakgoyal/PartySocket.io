# PartySocket.io

This is an example for how you can create a socket.io like interface for
PartySocket. PartySocket is the backend for PartyKit. PartySocket itself is a
thin wrapper around WebSockets.

This allows typesafe messages to be passed between clients and server (not zod
validated).

the code is a light wrapper around PartySocket to provide a socket.io like
interface.

## Example

### Without PartySocket.io

```ts
import PartSocket from "partysocket";

const conn = new PartySocket({ host: HOST, room: "my-room" });

conn.onmessage = (message) => {
  console.log(message.data);
  const data = JSON.parse(message.data); // data is unknown type

  // manually switching is error prone
  switch (data.type) {
    case "chat": // ...
    case "move": // ...
  }
};

// manually stringifying is not typesafe
// and easy to forget to adjust
conn.send("string message");
conn.send(JSON.stringify({ type: "chat", text: "hello" }));
```

### With PartySocket.io

```ts
import { PartySocket } from "partysocket.io";

const conn = new PartySocket({ host: HOST, room: "my-room" });

// typesafe event listeners
// message data is typed
conn.on("chat", ({ message }) => {/** ... */});
conn.on("move", ({ x, y }) => {/** ... */});

// allow broadcasting to all other clients directly from client
conn.sendObj("sendMessage", { message: "hello", broadcast: true });
```

## Additional Features

- broadcast from client to all other clients directly
- get notified on all client connects/disconnects
- get list of all connected clients from client
- client can get/set storage on server (dangerous, use with caution)
- typesafe, no more manual JSON parsing/stringifying
- highly customizable, you can still use raw `conn.send` and `conn.onmessage` if
  needed

## Setting up typescript types

```ts
// Socket.io-like types
type ServerToClientEvents = {
  clientList: { clients: string[] };             // client list updates
  getStorageResult: { key: string; value: any }; // getStorage result
  play: { filename: string; time: number };      // play event
};

type ClientToServerEvents = {
  play: { filename: string; time: number; broadcast?: true }; // play event, can be broadcasted
  setStorage: { key: string; value: any };                    // set data in server storage
  getStorage: { key: string };                                // get data from server storage
};

```
