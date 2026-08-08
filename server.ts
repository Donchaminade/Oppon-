import express from "express";
import http from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";

interface Player {
  id: string;
  nickname: string;
  avatar: string;
  isReady: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  mistakes: number;
  finished: boolean;
  finishTime?: number;
  placement?: number;
}

interface Room {
  id: string;
  name: string;
  hostId: string;
  isPrivate: boolean;
  code?: string;
  text: string;
  textTitle: string;
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  players: Record<string, Player>;
  maxPlayers: number;
  createdAt: number;
  startTime?: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

const SAMPLE_TEXTS = [
  {
    title: "Vitesse et Précision",
    text: "La dactylographie est l'art de saisir du texte sur un clavier avec rapidité et précision sans regarder ses doigts. Un entraînement régulier permet de développer la mémoire musculaire des mains."
  },
  {
    title: "Le Monde Moderne",
    text: "Aujourd'hui, maîtriser la frappe au clavier est une compétence essentielle dans le monde professionnel et personnel. Cela permet de gagner un temps précieux au quotidien."
  },
  {
    title: "Défis Technologiques",
    text: "Les technologies évoluent à une vitesse fulgurante. L'apprentissage continu et la maîtrise des outils numériques façonnent l'avenir des communications mondiales."
  },
  {
    title: "RapidTyping Challenge",
    text: "Gardez le dos droit, les pieds à plat sur le sol et reposez vos index sur les touches repères F et J. Ne cherchez pas la vitesse au début, la précision viendra naturellement."
  }
];

const rooms: Record<string, Room> = {};
const roomMessages: Record<string, ChatMessage[]> = {};

// Classroom Challenge Sessions Store
interface ClassroomServerSession {
  id: string;
  title: string;
  text: string;
  language: 'FR' | 'EN';
  durationSeconds: number;
  timeRemaining: number;
  status: 'setup' | 'waiting' | 'countdown' | 'active' | 'finished';
  startTime?: number;
  teacherName: string;
  students: Record<string, {
    studentId: string;
    studentName: string;
    className: string;
    avatar: string;
    wpm: number;
    cpm: number;
    accuracy: number;
    progress: number;
    typedTextSnippet: string;
    errors: number;
    rank: number;
    previousRank: number;
    finished: boolean;
    gradeNote: number;
    badgesEarned: string[];
    socketId: string;
  }>;
}

const classroomSessions: Record<string, ClassroomServerSession> = {};

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json());

  // Health check API endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", activeRooms: Object.keys(rooms).length });
  });

  // Socket.io event handling
  io.on("connection", (socket) => {
    let currentRoomId: string | null = null;

    socket.on("get_rooms", () => {
      const publicRooms = Object.values(rooms)
        .filter((r) => !r.isPrivate)
        .map((r) => ({
          id: r.id,
          name: r.name,
          playerCount: Object.keys(r.players).length,
          maxPlayers: r.maxPlayers,
          status: r.status,
          textTitle: r.textTitle
        }));
      socket.emit("rooms_list", publicRooms);
    });

    socket.on("create_room", (data: {
      name: string;
      nickname: string;
      avatar: string;
      maxPlayers?: number;
      isPrivate?: boolean;
      customText?: string;
    }) => {
      const roomId = "room_" + Math.random().toString(36).substring(2, 8);
      const chosenSample = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
      
      const newRoom: Room = {
        id: roomId,
        name: data.name || `Course de ${data.nickname}`,
        hostId: socket.id,
        isPrivate: !!data.isPrivate,
        code: data.isPrivate ? Math.floor(1000 + Math.random() * 9000).toString() : undefined,
        text: data.customText?.trim() || chosenSample.text,
        textTitle: data.customText ? "Texte personnalisé" : chosenSample.title,
        status: 'waiting',
        players: {
          [socket.id]: {
            id: socket.id,
            nickname: data.nickname || "Joueur 1",
            avatar: data.avatar || "⚡",
            isReady: false,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            mistakes: 0,
            finished: false
          }
        },
        maxPlayers: Math.min(Math.max(data.maxPlayers || 4, 2), 10),
        createdAt: Date.now()
      };

      rooms[roomId] = newRoom;
      roomMessages[roomId] = [];
      currentRoomId = roomId;

      socket.join(roomId);
      socket.emit("room_created", { room: newRoom, code: newRoom.code });
      io.emit("rooms_updated");
    });

    socket.on("join_room", (data: { roomId: string; code?: string; nickname: string; avatar: string }) => {
      const room = rooms[data.roomId];

      if (!room) {
        socket.emit("error_message", "Salon introuvable.");
        return;
      }

      if (room.isPrivate && room.code && room.code !== data.code?.trim()) {
        socket.emit("error_message", "Code de salon incorrect.");
        return;
      }

      if (Object.keys(room.players).length >= room.maxPlayers) {
        socket.emit("error_message", "Le salon est complet.");
        return;
      }

      if (room.status !== 'waiting') {
        socket.emit("error_message", "La course a déjà commencé dans ce salon.");
        return;
      }

      room.players[socket.id] = {
        id: socket.id,
        nickname: data.nickname || "Joueur",
        avatar: data.avatar || "🚀",
        isReady: false,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        mistakes: 0,
        finished: false
      };

      currentRoomId = room.id;
      socket.join(room.id);

      io.to(room.id).emit("room_state", room);
      io.to(room.id).emit("chat_history", roomMessages[room.id] || []);
      io.emit("rooms_updated");
    });

    socket.on("toggle_ready", () => {
      if (!currentRoomId || !rooms[currentRoomId]) return;
      const room = rooms[currentRoomId];
      if (room.players[socket.id]) {
        room.players[socket.id].isReady = !room.players[socket.id].isReady;
        io.to(room.id).emit("room_state", room);
      }
    });

    socket.on("start_race", () => {
      if (!currentRoomId || !rooms[currentRoomId]) return;
      const room = rooms[currentRoomId];

      if (room.hostId !== socket.id) {
        socket.emit("error_message", "Seul l'hôte peut démarrer la course.");
        return;
      }

      room.status = 'countdown';
      io.to(room.id).emit("room_state", room);

      let count = 3;
      io.to(room.id).emit("countdown_tick", count);

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          io.to(room.id).emit("countdown_tick", count);
        } else {
          clearInterval(timer);
          room.status = 'racing';
          room.startTime = Date.now();
          io.to(room.id).emit("race_started", { startTime: room.startTime });
          io.to(room.id).emit("room_state", room);
        }
      }, 1000);
    });

    socket.on("update_progress", (data: { progress: number; wpm: number; accuracy: number; mistakes: number }) => {
      if (!currentRoomId || !rooms[currentRoomId]) return;
      const room = rooms[currentRoomId];
      const player = room.players[socket.id];

      if (!player || room.status !== 'racing') return;

      player.progress = Math.min(100, Math.max(0, data.progress));
      player.wpm = data.wpm;
      player.accuracy = data.accuracy;
      player.mistakes = data.mistakes;

      if (player.progress >= 100 && !player.finished) {
        player.finished = true;
        player.finishTime = Date.now() - (room.startTime || Date.now());

        const finishedCount = Object.values(room.players).filter((p) => p.finished).length;
        player.placement = finishedCount;

        io.to(room.id).emit("player_finished", {
          playerId: socket.id,
          nickname: player.nickname,
          placement: player.placement,
          wpm: player.wpm,
          finishTime: player.finishTime
        });
      }

      const allFinished = Object.values(room.players).every((p) => p.finished);
      if (allFinished) {
        room.status = 'finished';
      }

      io.to(room.id).emit("room_state", room);
    });

    socket.on("send_message", (text: string) => {
      if (!currentRoomId || !rooms[currentRoomId] || !text.trim()) return;
      const room = rooms[currentRoomId];
      const player = room.players[socket.id];
      if (!player) return;

      const msg: ChatMessage = {
        id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
        senderId: socket.id,
        senderName: player.nickname,
        text: text.trim().substring(0, 200),
        timestamp: Date.now()
      };

      if (!roomMessages[room.id]) roomMessages[room.id] = [];
      roomMessages[room.id].push(msg);
      if (roomMessages[room.id].length > 50) roomMessages[room.id].shift();

      io.to(room.id).emit("new_message", msg);
    });

    socket.on("play_again", () => {
      if (!currentRoomId || !rooms[currentRoomId]) return;
      const room = rooms[currentRoomId];
      if (room.hostId !== socket.id) return;

      const chosenSample = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
      room.status = 'waiting';
      room.text = chosenSample.text;
      room.textTitle = chosenSample.title;
      room.startTime = undefined;

      Object.values(room.players).forEach((p) => {
        p.isReady = false;
        p.progress = 0;
        p.wpm = 0;
        p.accuracy = 100;
        p.mistakes = 0;
        p.finished = false;
        p.finishTime = undefined;
        p.placement = undefined;
      });

      io.to(room.id).emit("room_state", room);
    });

    // CLASSROOM LIVE CHALLENGE SOCKET EVENTS
    socket.on("classroom_get_session", () => {
      const activeSession = Object.values(classroomSessions)[0] || null;
      socket.emit("classroom_session_state", activeSession);
    });

    socket.on("classroom_create_session", (data: {
      title: string;
      text: string;
      language: 'FR' | 'EN';
      durationSeconds: number;
      teacherName: string;
    }) => {
      const sessionId = "cls_" + Date.now();
      const newSession: ClassroomServerSession = {
        id: sessionId,
        title: data.title,
        text: data.text,
        language: data.language || 'FR',
        durationSeconds: data.durationSeconds || 60,
        timeRemaining: data.durationSeconds || 60,
        status: 'waiting',
        teacherName: data.teacherName || 'Enseignant',
        students: {}
      };

      // Clear old sessions and keep newest
      Object.keys(classroomSessions).forEach((id) => delete classroomSessions[id]);
      classroomSessions[sessionId] = newSession;

      socket.join(sessionId);
      io.emit("classroom_session_state", newSession);
    });

    socket.on("classroom_join_session", (data: {
      sessionId: string;
      studentId: string;
      studentName: string;
      className: string;
      avatar: string;
    }) => {
      const session = classroomSessions[data.sessionId];
      if (!session) return;

      session.students[data.studentId] = {
        studentId: data.studentId,
        studentName: data.studentName,
        className: data.className || 'Élève',
        avatar: data.avatar || '👨‍🎓',
        wpm: 0,
        cpm: 0,
        accuracy: 100,
        progress: 0,
        typedTextSnippet: '',
        errors: 0,
        rank: Object.keys(session.students).length + 1,
        previousRank: Object.keys(session.students).length + 1,
        finished: false,
        gradeNote: 0,
        badgesEarned: [],
        socketId: socket.id
      };

      socket.join(data.sessionId);
      io.emit("classroom_session_state", session);
    });

    socket.on("classroom_start_top", (data: { sessionId: string }) => {
      const session = classroomSessions[data.sessionId];
      if (!session) return;

      session.status = 'countdown';
      io.emit("classroom_session_state", session);

      let countdown = 3;
      io.emit("classroom_countdown_tick", countdown);

      const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          io.emit("classroom_countdown_tick", countdown);
        } else {
          clearInterval(interval);
          session.status = 'active';
          session.startTime = Date.now();
          session.timeRemaining = session.durationSeconds;
          io.emit("classroom_session_state", session);

          // Timer ticker
          const timerTicker = setInterval(() => {
            if (!classroomSessions[data.sessionId] || session.status !== 'active') {
              clearInterval(timerTicker);
              return;
            }

            session.timeRemaining--;
            io.emit("classroom_timer_tick", { timeRemaining: session.timeRemaining });

            if (session.timeRemaining <= 0) {
              clearInterval(timerTicker);
              session.status = 'finished';

              // Calculate final grades and ranks
              const sorted = Object.values(session.students).sort((a, b) => {
                if (b.progress !== a.progress) return b.progress - a.progress;
                if (b.wpm !== a.wpm) return b.wpm - a.wpm;
                return b.accuracy - a.accuracy;
              });

              sorted.forEach((std, index) => {
                std.rank = index + 1;
                std.finished = true;
                // Calculate note out of 20
                // WPM contribution (max 12 pts for 50 WPM) + Accuracy (max 8 pts for 100%)
                const wpmPts = Math.min(12, (std.wpm / 40) * 12);
                const accPts = (std.accuracy / 100) * 8;
                std.gradeNote = Math.min(20, Math.round((wpmPts + accPts) * 2) / 2);

                // Badges calculation
                const badges: string[] = ['badge_first_step'];
                if (std.wpm >= 80) badges.push('badge_fast_80');
                else if (std.wpm >= 50) badges.push('badge_speed_50');
                else if (std.wpm >= 30) badges.push('badge_speed_30');

                if (std.accuracy === 100) badges.push('badge_accuracy_100');
                if (index === 0) badges.push('badge_multiplayer_win');

                std.badgesEarned = badges;
              });

              io.emit("classroom_session_state", session);
            }
          }, 1000);
        }
      }, 1000);
    });

    socket.on("classroom_update_live", (data: {
      sessionId: string;
      studentId: string;
      wpm: number;
      cpm: number;
      accuracy: number;
      progress: number;
      typedTextSnippet: string;
      errors: number;
    }) => {
      const session = classroomSessions[data.sessionId];
      if (!session) return;

      const std = session.students[data.studentId];
      if (!std) return;

      std.wpm = data.wpm;
      std.cpm = data.cpm;
      std.accuracy = data.accuracy;
      std.progress = data.progress;
      std.typedTextSnippet = data.typedTextSnippet;
      std.errors = data.errors;

      // Recalculate dynamic live ranks
      const sorted = Object.values(session.students).sort((a, b) => {
        if (b.progress !== a.progress) return b.progress - a.progress;
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        return b.accuracy - a.accuracy;
      });

      sorted.forEach((studentItem, idx) => {
        studentItem.previousRank = studentItem.rank;
        studentItem.rank = idx + 1;
      });

      io.emit("classroom_session_state", session);
    });

    const handleLeave = () => {
      if (currentRoomId && rooms[currentRoomId]) {
        const room = rooms[currentRoomId];
        delete room.players[socket.id];

        const remainingCount = Object.keys(room.players).length;
        if (remainingCount === 0) {
          delete rooms[currentRoomId];
          delete roomMessages[currentRoomId];
        } else {
          if (room.hostId === socket.id) {
            room.hostId = Object.keys(room.players)[0];
          }
          io.to(room.id).emit("room_state", room);
        }
        io.emit("rooms_updated");
      }
    };

    socket.on("leave_room", handleLeave);
    socket.on("disconnect", handleLeave);
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ TypeMaster & RapidTyping server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
