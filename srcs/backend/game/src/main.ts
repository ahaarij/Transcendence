import type { FastifyInstance } from 'fastify';

// registers all game related routes to fastify app
export async function registerGameRoutes(app: FastifyInstance) {
  
  // health check endpoint for game service
  app.get("/game/health", async () => ({ status: "ok", service: "game" }));
  
  // records a match result after game ends
  app.post("/game/match", async (request, reply) => {
    try {
      const {
        userId,
        userSide,
        opponentId,
        userScore,
        opponentScore,
        didUserWin,
        gameMode,
        tournamentSize,
        tournamentRound,
        isEliminated
      } = request.body as {
        userId: number;
        userSide: number;
        opponentId: string;
        userScore: number;
        opponentScore: number;
        didUserWin: boolean;
        gameMode: string;
        tournamentSize?: number;
        tournamentRound?: number;
        isEliminated?: boolean;
      };

      // checks if all required fields are present
      if (!userId || !opponentId || userScore === undefined || opponentScore === undefined) {
        return reply.status(400).send({ error: "missing required match data" });
      }

      // verifies user exists in database
      const user = await app.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return reply.status(404).send({ error: "user not found" });
      }

      // creates match record in database
      const match = await app.prisma.match.create({
        data: {
          userId,
          opponentId,
          userSide,
          userScore,
          opponentScore,
          didUserWin,
          gameMode,
          tournamentSize,
          tournamentRound,
          isEliminated,
        },
      });

      return reply.send({
        message: "match recorded successfully",
        match: {
          id: match.id,
          playedAt: match.playedAt,
        },
      });
    } catch (error) {
      console.error("error recording match:", error);
      return reply.status(500).send({ 
        error: "failed to record match",
        details: error instanceof Error ? error.message : "unknown error"
      });
    }
  });

  // gets match history for a user with stats
  app.get("/game/history/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const id = parseInt(userId);

      // validates user id is a number
      if (isNaN(id)) {
        return reply.status(400).send({ error: "invalid user id" });
      }

      // fetches all matches for this user from database
      const matches = await app.prisma.match.findMany({
        where: { userId: id },
        orderBy: { playedAt: 'desc' },  // most recent first
        take: 50,  // limit to last 50 matches
      });

      // calculates win/loss stats from matches
      const totalMatches = matches.length;
      const wins = matches.filter(m => m.didUserWin).length;
      const losses = totalMatches - wins;

      return reply.send({
        stats: {
          totalMatches,
          wins,
          losses,
          winRate: totalMatches > 0 ? (wins / totalMatches * 100).toFixed(1) : "0.0",
        },
        matches: matches.map(m => ({
          id: m.id,
          opponent: m.opponentId,
          userScore: m.userScore,
          opponentScore: m.opponentScore,
          won: m.didUserWin,
          gameMode: m.gameMode,
          playedAt: m.playedAt,
        })),
      });
    } catch (error) {
      console.error("error fetching match history:", error);
      return reply.status(500).send({ 
        error: "failed to fetch match history",
        details: error instanceof Error ? error.message : "unknown error"
      });
    }
  });

  // gets detailed stats for a user
  app.get("/game/stats/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const id = parseInt(userId);

      // validates user id is a number
      if (isNaN(id)) {
        return reply.status(400).send({ error: "invalid user id" });
      }

      // fetches all matches for calculating stats
      const matches = await app.prisma.match.findMany({
        where: { userId: id },
      });

      // returns empty stats if no matches found
      if (matches.length === 0) {
        return reply.send({
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winRate: "0.0",
          avgScore: 0,
          pvpWins: 0,
          pvaiWins: 0,
          tournamentWins: 0,
        });
      }

      // calculates various statistics from matches
      const totalMatches = matches.length;
      const wins = matches.filter(m => m.didUserWin).length;
      const losses = totalMatches - wins;
      const avgScore = matches.reduce((sum, m) => sum + m.userScore, 0) / totalMatches;
      
      // counts wins by game mode
      const pvpWins = matches.filter(m => m.gameMode === 'PvP' && m.didUserWin).length;
      const pvaiWins = matches.filter(m => m.gameMode === 'PvAI' && m.didUserWin).length;
      const tournamentWins = matches.filter(m => m.gameMode === 'Tournament' && m.didUserWin).length;

      return reply.send({
        totalMatches,
        wins,
        losses,
        winRate: (wins / totalMatches * 100).toFixed(1),
        avgScore: avgScore.toFixed(1),
        pvpWins,
        pvaiWins,
        tournamentWins,
      });
    } catch (error) {
      console.error("error fetching stats:", error);
      return reply.status(500).send({ 
        error: "failed to fetch stats",
        details: error instanceof Error ? error.message : "unknown error"
      });
    }
  });
}
