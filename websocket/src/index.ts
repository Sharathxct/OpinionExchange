import WebSocket, { WebSocketServer } from 'ws';
import Redis from 'ioredis';

const wss = new WebSocketServer({ port: 8080 });
const redis = new Redis();

interface Sockets {
  [stockSymbol: string]: WebSocket[];
}

let sockets: Sockets = {};

function ensureChannel(stockSymbol: string) {
  if (!sockets[stockSymbol]) {
    sockets[stockSymbol] = [];
  }
}

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', (d) => {
    try {
      const data = JSON.parse(d.toString());

      // console.log('received: %s', d);
      // check the message type if its subscribe
      // ensure channel name and push the ws to channels[ch]
      if (data.type === "SUBSCRIBE") {
        ensureChannel(data.stockSymbol);
        sockets[data.stockSymbol].push(ws);
        redis.subscribe(data.stockSymbole, (err, count) => {
          if (err) {
            console.error('Failed to subscribe:', err);
          } else {
            console.log(`Subscribed to ${count} channel(s).`);
          }
        })
      }
      // on unsubcribe pop the socket from the sockets[stockSymbol] and if the length 0 the redis.unsubscribe(stockSymbol)
      if (data.type === "UNSUBSCRIBE") {
        sockets[data.stockSymbol] = sockets[data.stockSymbol].filter(socket => socket !== ws)
        if (sockets[data.stockSymbol].length === 0) {
          delete sockets[data.stockSymbol]
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  });

  ws.send('something');
});

// on message send the message to all the sockets state[stockSymbol]
redis.on('message', (stockSymbol, message) => {
  sockets[stockSymbol].forEach(socket => {
    socket.send(message)
  })
})

// test change
