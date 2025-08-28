import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect() {
    const clients = Array.from(this.room.getConnections()).map(c => c.id);
    this.broadcastJSON("clientList", { clients });
  }

  async onRequest(req: Party.Request) {
    const url = new URL(req.url);
    // storage API
    if (url.pathname.startsWith(`/parties/${this.room.name}/${this.room.id}/storage`)) {
      const key = url.pathname.split(`${this.room.name}/${this.room.id}/storage/`)[1];
      if (req.method === "GET") {
        const value = await this.room.storage.get(key);
        return new Response(JSON.stringify({ value }));
      } else if (req.method === "POST") {
        const { value } = await req.json() as { value: unknown };
        await this.room.storage.put(key, value);
        return new Response(JSON.stringify({ value }));
      }
    }

    return new Response(`Unknown Request`, { status: 404 });
  }

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message);
    console.log(data);
    // broadcast to everyone in the room except the sender
    if (data.broadcast) {
      const { broadcast: _, ...rest } = data;
      this.broadcastJSON(rest, [sender.id]);
      return;
    }
  }
  onClose(conn: Party.Connection) {
    const clients = Array.from(this.room.getConnections()).map(c => c.id)
    this.broadcastJSON("clientList", { clients });
  }

  broadcastJSON<T extends keyof ServerToClientEvents>(type: T, obj: ServerToClientEvents[T], excludeIDs?: string[]): void {
    this.room.broadcast(JSON.stringify({ type, ...obj }), excludeIDs);
  }
}

Server satisfies Party.Worker;
