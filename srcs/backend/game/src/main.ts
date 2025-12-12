import type { FastifyInstance } from 'fastify';

export async function registerGameRoutes(app: FastifyInstance) {
  
  // POST /game/match - records a match result after game ends
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

      // validate required fields
      if (!userId || !opponentId || userScore === undefined || opponentScore === undefined) {
        return reply.status(400).send({ error: "missing required match data" });
      }

      // check if user exists
      const user = await app.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return reply.status(404).send({ error: "user not found" });
      }

      // save match to database
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

  // GET /game/history/:userId - gets match history for a user
  app.get("/game/history/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const id = parseInt(userId);

      if (isNaN(id)) {
        return reply.status(400).send({ error: "invalid user id" });
      }

      // get all matches for this user
      const matches = await app.prisma.match.findMany({
        where: { userId: id },
        orderBy: { playedAt: 'desc' },  // most recent first
        take: 50,  // limit to last 50 matches
      });

      // calculate win/loss stats
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

  // GET /game/stats/:userId - gets detailed stats for a user
  app.get("/game/stats/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const id = parseInt(userId);

      if (isNaN(id)) {
        return reply.status(400).send({ error: "invalid user id" });
      }

      const matches = await app.prisma.match.findMany({
        where: { userId: id },
      });

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

      // calculate various stats
      const totalMatches = matches.length;
      const wins = matches.filter(m => m.didUserWin).length;
      const losses = totalMatches - wins;
      const avgScore = matches.reduce((sum, m) => sum + m.userScore, 0) / totalMatches;
      
      // count wins by game mode
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
