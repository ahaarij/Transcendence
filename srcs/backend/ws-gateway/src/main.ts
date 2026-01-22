import 'dotenv/config';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import axios from 'axios';

// main function that starts websocket gateway service
async function start() {
  const app = Fastify({ logger: true });

  // registers cors for cross origin requests
  await app.register(cors, {
    origin: true,  // allows all origins
    credentials: true,  // allows cookies
  });

  if (!process.env.JWT_ACCESS_SECRET) {
    console.error("CRITICAL: JWT_ACCESS_SECRET is required");
    process.exit(1);
  }

  // registers jwt for token verification
  await app.register(jwt, {
    secret: process.env.JWT_ACCESS_SECRET,
  });

  // registers websocket support
  await app.register(websocket);

  // health check endpoint for gateway
  app.get('/ws/health', async () => ({ status: 'ok', service: 'ws-gateway' }));

  // stores active websocket connections by user id (uuid string)
  const connections = new Map<string, any>();

  // websocket route for real time game communication
  app.register(async function (fastify) {
    fastify.get('/ws/game', { websocket: true }, (socket, request) => {
      let userId: string | null = null;

      // handles incoming messages from client
      socket.on('message', async (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());

          // authenticate user on first message
          if (data.type === 'auth') {
            try {
              // verifies jwt token from client
              const decoded = app.jwt.verify(data.token) as { userId: string };
              userId = decoded.userId;

              // stores connection for this user
              connections.set(userId, socket);

              // sends success message back to client
              socket.send(JSON.stringify({
                type: 'authenticated',
                userId: userId,
              }));

              console.log(`user ${userId} connected to websocket`);
            } catch (error) {
              // invalid token
              socket.send(JSON.stringify({
                type: 'error',
                message: 'invalid authentication token',
              }));
              socket.close();
            }
            return;
          }

          // requires authentication for other messages
          if (!userId) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'not authenticated',
            }));
            return;
          }

          // handles different message types for game
          switch (data.type) {
            case 'game:join':
              // broadcasts to all connected users that someone joined
              connections.forEach((conn, id) => {
                if (id !== userId) {
                  conn.send(JSON.stringify({
                    type: 'game:player-joined',
                    userId: userId,
                  }));
                }
              });
              break;

            case 'game:move':
              // sends player movement to other players
              connections.forEach((conn, id) => {
                if (id !== userId) {
                  conn.send(JSON.stringify({
                    type: 'game:player-move',
                    userId: userId,
                    data: data.data,
                  }));
                }
              });
              break;

            case 'game:state':
              // broadcasts game state updates to all players
              connections.forEach((conn) => {
                conn.send(JSON.stringify({
                  type: 'game:state-update',
                  data: data.data,
                }));
              });
              break;

            default:
              // unknown message type
              socket.send(JSON.stringify({
                type: 'error',
                message: 'unknown message type',
              }));
          }
        } catch (error) {
          console.error('websocket message error:', error);
          socket.send(JSON.stringify({
            type: 'error',
            message: 'failed to process message',
          }));
        }
      });

      // handles client disconnect
      socket.on('close', () => {
        if (userId) {
          // removes connection from map
          connections.delete(userId);

          // notifies other users that player left
          connections.forEach((conn) => {
            conn.send(JSON.stringify({
              type: 'game:player-left',
              userId: userId,
            }));
          });

          console.log(`user ${userId} disconnected from websocket`);
        }
      });

      // handles connection errors
      socket.on('error', (error) => {
        console.error('websocket error:', error);
        if (userId) {
          connections.delete(userId);
        }
      });
    });
  });

  // starts server on configured port
  const port = parseInt(process.env.WS_PORT || '3003', 10);

  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ websocket gateway running on ws://localhost:${port}`);
    console.log(`   - game websocket: ws://localhost:${port}/ws/game`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// starts the gateway service
start();
