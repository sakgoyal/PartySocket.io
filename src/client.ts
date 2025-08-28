import "./styles.css";

import PartySocketBase from "partysocket";

function setupPassword() {
  while (!localStorage.getItem("groupID")) {
    const val = prompt("Enter a complicated password:");
    if (val) localStorage.setItem("groupID", val);
  }
  return localStorage.getItem("groupID")!;
}
const groupID = setupPassword();

class PartySocket extends PartySocketBase {
  registedEvents = new Map<string, (args: ServerToClientEvents[T]) => void>();
  sendObject = <T extends keyof ClientToServerEvents>(type: T, args: ClientToServerEvents[T]) => {
    this.send(JSON.stringify({ type, ...args }));
  };

  on = <T extends keyof ServerToClientEvents>(event: T, callback: (args: ServerToClientEvents[T]) => void) => {
    this.registedEvents.set(event, callback);
  };

  override onmessage = (message: MessageEvent) => {
    const data: {type: string} & ServerToClientEvents[keyof ServerToClientEvents] = JSON.parse(message.data);
    if (data.type && this.registedEvents.has(data.type)) {
      const callback = this.registedEvents.get(data.type)!;
      callback(data);
    } else {
      console.warn("No handler for message type:", data.type, data);
    }
  };

  broadcast = <T extends keyof ClientToServerEvents>(event: T, args: ClientToServerEvents[T]) => {
    this.send(JSON.stringify({ event, args, }));
  };
  storage = {
    get: async <T>(key: string, defaultValue?: T) => {
      const resp = await PartySocket.fetch({host: this.host, room: this.room!, path: `/storage/${key}`})
      if (resp.ok) {
        const data = await resp.json()
        return data.value;
      }
      return defaultValue;
    },
    set: async <T>(key: string, value: T) => {
      const resp = await PartySocket.fetch({host: this.host, room: this.room!, path: `/storage/${key}` }, {
        body: JSON.stringify({ value }),
        method: "POST",
      });
      return resp.json() as Promise<T>; // return the stored value
    }
  };
}

const conn = new PartySocket({ host: PARTYKIT_HOST, room: groupID });

conn.on("clientList", ({ clients }) => { renderClientList(clients) });

const clientsList = document.getElementById("clients-list") as HTMLDivElement;


function renderClientList(clients: string[]) {
  clientsList.innerHTML = "";
  // add self to list to keep at the top
  clientsList.innerHTML = `<div id="${conn.id}">You: ${conn.id}</div>`;

  clients.forEach(clientID => {
    if (clientID === conn.id) return; // skip self
    clientsList.innerHTML += `<div id="${clientID}">${clientID}</div>`;
  });
}

window.PartySocket = PartySocketBase;
