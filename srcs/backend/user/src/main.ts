import type { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';

// helper function to extract and verify auth token
async function getAuthenticatedUserId(app: FastifyInstance, request: any): Promise<string | null> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = app.jwt.verify(token) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// registers all user related routes to fastify app
export async function registerUserRoutes(app: FastifyInstance) {
  // health check endpoint for user service
  app.get("/user/health", async () => ({ status: "ok", service: "user" }));
  
  // gets public profile info by username
  app.get("/user/profile/:username", async (request, reply) => {
    try {
      const { username } = request.params as { username: string };
      
      // finds user in database by username
      const user = await app.prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          avatar: true,
          createdAt: true,
        }
      });

      if (!user) {
        return reply.status(404).send({ error: "user not found" });
      }

      return reply.send(user);
    } catch (error) {
      console.error("get profile error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // updates own profile info
  app.put("/user/me", async (request, reply) => {
    try {
      // extracts and verifies auth token
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }
      
      const token = authHeader.split(" ")[1];
      const decoded = app.jwt.verify(token) as { userId: string };
      
      const { username, avatar } = request.body as { username?: string; avatar?: string };
      
      let avatarUrl = avatar;

      // handles base64 image upload if provided
      if (avatar && avatar.startsWith('data:image')) {
        try {
          // extracts image data from base64 string
          const matches = avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const extension = type.split('/')[1];
            const filename = `avatar-${decoded.userId}-${Date.now()}.${extension}`;
            const uploadDir = '/app/public/uploads';
            
            // creates upload directory if it doesnt exist
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            // saves avatar file to disk
            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, buffer);
            
            avatarUrl = `/public/uploads/${filename}`;
          }
        } catch (err) {
          console.error("failed to save avatar:", err);
        }
      }

      // checks if username is taken if changing username
      if (username) {
        const existing = await app.prisma.user.findUnique({
          where: { username },
        });
        if (existing && existing.id !== decoded.userId) {
          return reply.status(400).send({ error: "username already taken" });
        }
      }

      // updates user in database with new info
      const updatedUser = await app.prisma.user.update({
        where: { id: decoded.userId },
        data: {
          ...(username && { username }),
          ...(avatarUrl && { avatar: avatarUrl }),
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        }
      });

      return reply.send(updatedUser);
    } catch (error) {
      console.error("update profile error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // gets user info by id for internal service calls
  app.get("/user/:userId", async (request, reply) => {
    try {
      // extracts and verifies auth token
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }

      const { userId } = request.params as { userId: string };

      // validates user id is provided
      if (!userId) {
        return reply.status(400).send({ error: "invalid user id" });
      }

      // finds user in database by id (uuid string)
      const user = await app.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          createdAt: true,
        }
      });

      if (!user) {
        return reply.status(404).send({ error: "user not found" });
      }

      return reply.send(user);
    } catch (error) {
      console.error("get user error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // ==================== FRIEND ENDPOINTS ====================

  // sends a friend request to another user
  app.post("/user/friends/request", async (request, reply) => {
    try {
      const userId = await getAuthenticatedUserId(app, request);
      if (!userId) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }

      const { friendUsername } = request.body as { friendUsername: string };

      if (!friendUsername) {
        return reply.status(400).send({ error: "friend username required" });
      }

      // finds the friend user by username
      const friend = await app.prisma.user.findUnique({
        where: { username: friendUsername },
      });

      if (!friend) {
        return reply.status(404).send({ error: "user not found" });
      }

      // prevents adding yourself as friend
      if (friend.id === userId) {
        return reply.status(400).send({ error: "cannot add yourself as friend" });
      }

      // checks if friend request already exists (in either direction)
      const existingRequest = await app.prisma.friend.findFirst({
        where: {
          OR: [
            { userId, friendId: friend.id },
            { userId: friend.id, friendId: userId },
          ],
        },
      });

      if (existingRequest) {
        if (existingRequest.status === "accepted") {
          return reply.status(400).send({ error: "already friends with this user" });
        }
        if (existingRequest.status === "pending") {
          return reply.status(400).send({ error: "friend request already pending" });
        }
      }

      // creates friend request
      const friendRequest = await app.prisma.friend.create({
        data: {
          userId,
          friendId: friend.id,
          status: "pending",
        },
      });

      return reply.send({
        message: "friend request sent",
        requestId: friendRequest.id,
      });
    } catch (error) {
      console.error("send friend request error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // accepts or rejects a friend request
  app.put("/user/friends/respond", async (request, reply) => {
    try {
      const userId = await getAuthenticatedUserId(app, request);
      if (!userId) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }

      const { requestId, accept } = request.body as { requestId: number; accept: boolean };

      if (requestId === undefined || accept === undefined) {
        return reply.status(400).send({ error: "requestId and accept required" });
      }

      // finds the friend request
      const friendRequest = await app.prisma.friend.findUnique({
        where: { id: requestId },
      });

      if (!friendRequest) {
        return reply.status(404).send({ error: "friend request not found" });
      }

      // verifies user is the recipient of the request
      if (friendRequest.friendId !== userId) {
        return reply.status(403).send({ error: "not authorized to respond to this request" });
      }

      if (friendRequest.status !== "pending") {
        return reply.status(400).send({ error: "request already responded to" });
      }

      // updates friend request status
      const updatedRequest = await app.prisma.friend.update({
        where: { id: requestId },
        data: { status: accept ? "accepted" : "rejected" },
      });

      return reply.send({
        message: accept ? "friend request accepted" : "friend request rejected",
        status: updatedRequest.status,
      });
    } catch (error) {
      console.error("respond to friend request error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // gets list of friends and pending requests
  app.get("/user/friends", async (request, reply) => {
    try {
      const userId = await getAuthenticatedUserId(app, request);
      if (!userId) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }

      // gets all accepted friends (both directions)
      const friendships = await app.prisma.friend.findMany({
        where: {
          OR: [
            { userId, status: "accepted" },
            { friendId: userId, status: "accepted" },
          ],
        },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          friend: { select: { id: true, username: true, avatar: true } },
        },
      });

      // gets pending friend requests received
      const pendingRequests = await app.prisma.friend.findMany({
        where: {
          friendId: userId,
          status: "pending",
        },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      });

      // gets pending friend requests sent
      const sentRequests = await app.prisma.friend.findMany({
        where: {
          userId,
          status: "pending",
        },
        include: {
          friend: { select: { id: true, username: true, avatar: true } },
        },
      });

      // formats friends list (get the other user in each friendship)
      const friends = friendships.map(f => {
        const friendUser = f.userId === userId ? f.friend : f.user;
        return {
          id: friendUser.id,
          username: friendUser.username,
          avatar: friendUser.avatar,
          friendshipId: f.id,
        };
      });

      return reply.send({
        friends,
        pendingRequests: pendingRequests.map(r => ({
          requestId: r.id,
          from: r.user,
          createdAt: r.createdAt,
        })),
        sentRequests: sentRequests.map(r => ({
          requestId: r.id,
          to: r.friend,
          createdAt: r.createdAt,
        })),
      });
    } catch (error) {
      console.error("get friends error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // removes a friend
  app.delete("/user/friends/:friendshipId", async (request, reply) => {
    try {
      const userId = await getAuthenticatedUserId(app, request);
      if (!userId) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }

      const { friendshipId } = request.params as { friendshipId: string };
      const id = parseInt(friendshipId);

      if (isNaN(id)) {
        return reply.status(400).send({ error: "invalid friendship id" });
      }

      // finds the friendship
      const friendship = await app.prisma.friend.findUnique({
        where: { id },
      });

      if (!friendship) {
        return reply.status(404).send({ error: "friendship not found" });
      }

      // verifies user is part of this friendship
      if (friendship.userId !== userId && friendship.friendId !== userId) {
        return reply.status(403).send({ error: "not authorized to remove this friend" });
      }

      // deletes the friendship
      await app.prisma.friend.delete({
        where: { id },
      });

      return reply.send({ message: "friend removed successfully" });
    } catch (error) {
      console.error("remove friend error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // gets friend's W/L ratio (stats)
  app.get("/user/friends/:friendId/stats", async (request, reply) => {
    try {
      const userId = await getAuthenticatedUserId(app, request);
      if (!userId) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }

      const { friendId } = request.params as { friendId: string };

      // verifies they are friends
      const friendship = await app.prisma.friend.findFirst({
        where: {
          OR: [
            { userId, friendId, status: "accepted" },
            { userId: friendId, friendId: userId, status: "accepted" },
          ],
        },
      });

      if (!friendship) {
        return reply.status(403).send({ error: "you are not friends with this user" });
      }

      // gets friend user info
      const friend = await app.prisma.user.findUnique({
        where: { id: friendId },
        select: { id: true, username: true, avatar: true },
      });

      if (!friend) {
        return reply.status(404).send({ error: "user not found" });
      }

      // fetches all matches for calculating stats
      const matches = await app.prisma.match.findMany({
        where: { userId: friendId },
      });

      // calculates W/L stats
      const totalMatches = matches.length;
      const wins = matches.filter(m => m.didUserWin).length;
      const losses = totalMatches - wins;

      // counts wins by game mode
      const pvpWins = matches.filter(m => m.gameMode === 'PvP' && m.didUserWin).length;
      const pvpLosses = matches.filter(m => m.gameMode === 'PvP' && !m.didUserWin).length;
      const pvaiWins = matches.filter(m => m.gameMode === 'PvAI' && m.didUserWin).length;
      const pvaiLosses = matches.filter(m => m.gameMode === 'PvAI' && !m.didUserWin).length;
      const tournamentWins = matches.filter(m => m.gameMode === 'Tournament' && m.didUserWin).length;
      const tournamentLosses = matches.filter(m => m.gameMode === 'Tournament' && !m.didUserWin).length;

      return reply.send({
        friend,
        stats: {
          totalMatches,
          wins,
          losses,
          winRate: totalMatches > 0 ? (wins / totalMatches * 100).toFixed(1) : "0.0",
          wlRatio: losses > 0 ? (wins / losses).toFixed(2) : wins > 0 ? "∞" : "0.00",
          byGameMode: {
            pvp: { wins: pvpWins, losses: pvpLosses },
            pvai: { wins: pvaiWins, losses: pvaiLosses },
            tournament: { wins: tournamentWins, losses: tournamentLosses },
          },
        },
      });
    } catch (error) {
      console.error("get friend stats error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // gets friend's match history
  app.get("/user/friends/:friendId/matches", async (request, reply) => {
    try {
      const userId = await getAuthenticatedUserId(app, request);
      if (!userId) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }

      const { friendId } = request.params as { friendId: string };

      // verifies they are friends
      const friendship = await app.prisma.friend.findFirst({
        where: {
          OR: [
            { userId, friendId, status: "accepted" },
            { userId: friendId, friendId: userId, status: "accepted" },
          ],
        },
      });

      if (!friendship) {
        return reply.status(403).send({ error: "you are not friends with this user" });
      }

      // gets friend user info
      const friend = await app.prisma.user.findUnique({
        where: { id: friendId },
        select: { id: true, username: true, avatar: true },
      });

      if (!friend) {
        return reply.status(404).send({ error: "user not found" });
      }

      // fetches match history
      const matches = await app.prisma.match.findMany({
        where: { userId: friendId },
        orderBy: { playedAt: 'desc' },
        take: 50,
      });

      return reply.send({
        friend,
        matches: matches.map(m => ({
          id: m.id,
          opponent: m.opponentId,
          userScore: m.userScore,
          opponentScore: m.opponentScore,
          won: m.didUserWin,
          gameMode: m.gameMode,
          playedAt: m.playedAt,
          tournamentRound: m.tournamentRound,
        })),
      });
    } catch (error) {
      console.error("get friend match history error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });
}