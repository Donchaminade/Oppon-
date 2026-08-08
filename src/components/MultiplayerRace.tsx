import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { Room, Player, ChatMessage, AppSettings } from '../types';
import { sounds } from '../utils/sound';
import { Trophy, Users, Send, Play, Lock, Sparkles, LogOut, CheckCircle2, MessageSquare, Flag } from 'lucide-react';

interface MultiplayerRaceProps {
  settings: AppSettings;
}

const AVATARS = ['⚡', '🚀', '🏎️', '👾', '👑', '🦄', '🏆', '💥'];

export const MultiplayerRace: React.FC<MultiplayerRaceProps> = ({ settings }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // User state
  const [nickname, setNickname] = useState(() => localStorage.getItem('typemaster_nickname') || 'Dactylo_' + Math.floor(Math.random() * 900 + 100));
  const [avatar, setAvatar] = useState('⚡');

  // Rooms & current room
  const [publicRooms, setPublicRooms] = useState<{ id: string; name: string; playerCount: number; maxPlayers: number; status: string; textTitle: string }[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local race state
  const [createRoomName, setCreateRoomName] = useState('');
  const [createIsPrivate, setCreateIsPrivate] = useState(false);
  const [createCustomText, setCreateCustomText] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const [userInput, setUserInput] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('get_rooms');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('rooms_list', (roomsList) => {
      setPublicRooms(roomsList);
    });

    newSocket.on('rooms_updated', () => {
      newSocket.emit('get_rooms');
    });

    newSocket.on('room_created', (data: { room: Room }) => {
      setCurrentRoom(data.room);
      setUserInput('');
      setMistakes(0);
    });

    newSocket.on('room_state', (room: Room) => {
      setCurrentRoom(room);
      if (room.status === 'finished') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    });

    newSocket.on('countdown_tick', (count: number) => {
      setCountdown(count);
      sounds.playKeyPress(settings.soundEnabled);
    });

    newSocket.on('race_started', () => {
      setCountdown(null);
      setUserInput('');
      setMistakes(0);
      sounds.playSuccess(settings.soundEnabled);
      if (inputRef.current) inputRef.current.focus();
    });

    newSocket.on('chat_history', (msgs: ChatMessage[]) => {
      setChatMessages(msgs);
    });

    newSocket.on('new_message', (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    newSocket.on('error_message', (msg: string) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [settings.soundEnabled]);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Save nickname
  useEffect(() => {
    localStorage.setItem('typemaster_nickname', nickname);
  }, [nickname]);

  // Handle typing input during race
  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!socket || !currentRoom || currentRoom.status !== 'racing') return;

    const val = e.target.value;
    const targetText = currentRoom.text;

    if (val.length > userInput.length) {
      const typedChar = val[val.length - 1];
      const expectedChar = targetText[userInput.length];

      if (typedChar === expectedChar) {
        sounds.playKeyPress(settings.soundEnabled);
        setUserInput(val);

        const progress = (val.length / targetText.length) * 100;

        // Calculate current WPM
        const elapsedSec = (Date.now() - (currentRoom.startTime || Date.now())) / 1000;
        const wpm = Math.round((val.length / 5) / (elapsedSec / 60)) || 0;
        const accuracy = Math.round((val.length / (val.length + mistakes)) * 100) || 100;

        socket.emit('update_progress', {
          progress,
          wpm,
          accuracy,
          mistakes
        });
      } else {
        sounds.playError(settings.soundEnabled);
        setMistakes((prev) => prev + 1);
      }
    }
  };

  const handleCreateRoom = () => {
    if (!socket) return;
    socket.emit('create_room', {
      name: createRoomName.trim() || `Course de ${nickname}`,
      nickname,
      avatar,
      isPrivate: createIsPrivate,
      customText: createCustomText.trim()
    });
  };

  const handleJoinRoom = (roomId: string, code?: string) => {
    if (!socket) return;
    socket.emit('join_room', {
      roomId,
      code,
      nickname,
      avatar
    });
  };

  const handleToggleReady = () => {
    if (!socket) return;
    socket.emit('toggle_ready');
  };

  const handleStartRace = () => {
    if (!socket) return;
    socket.emit('start_race');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !chatInput.trim()) return;
    socket.emit('send_message', chatInput);
    setChatInput('');
  };

  const handleLeaveRoom = () => {
    if (!socket) return;
    socket.emit('leave_room');
    setCurrentRoom(null);
    socket.emit('get_rooms');
  };

  const handlePlayAgain = () => {
    if (!socket) return;
    socket.emit('play_again');
    setUserInput('');
    setMistakes(0);
  };

  // If in a room, render Race or Staging Lobby
  if (currentRoom) {
    const myPlayer = currentRoom.players[socket?.id || ''];
    const playersList: Player[] = Object.values(currentRoom.players);
    const isHost = currentRoom.hostId === socket?.id;

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Room Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeaveRoom}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
              title="Quitter le salon"
            >
              <LogOut size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{currentRoom.name}</h2>
                {currentRoom.isPrivate && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <Lock size={10} /> Code: {currentRoom.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Statut : <span className="text-cyan-400 uppercase font-semibold">{currentRoom.status}</span> | {playersList.length}/{currentRoom.maxPlayers} Joueurs
              </p>
            </div>
          </div>

          {/* Host Controls */}
          {currentRoom.status === 'waiting' && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleReady}
                className={`
                  px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg
                  ${myPlayer?.isReady
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}
                `}
              >
                <CheckCircle2 size={16} /> {myPlayer?.isReady ? 'PRÊT !' : 'Se déclarer prêt'}
              </button>

              {isHost && (
                <button
                  onClick={handleStartRace}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  <Play size={16} /> Lancer la course
                </button>
              )}
            </div>
          )}

          {currentRoom.status === 'finished' && isHost && (
            <button
              onClick={handlePlayAgain}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <Sparkles size={16} /> Rejouer une manche
            </button>
          )}
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-10 text-center shadow-2xl animate-pulse">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Préparer vos doigts...</div>
            <div className="text-7xl font-black text-white font-mono my-2">{countdown}</div>
            <div className="text-sm text-slate-400">Départ imminent !</div>
          </div>
        )}

        {/* Race Track Canvas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flag className="text-cyan-400" size={18} /> Piste de Course Multijoueur
            </h3>
            <span className="text-xs text-slate-400 font-mono">{currentRoom.textTitle}</span>
          </div>

          {/* Animated Player Tracks */}
          <div className="space-y-4">
            {playersList.map((player) => (
              <div key={player.id} className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-lg">{player.avatar}</span>
                    <span>{player.nickname}</span>
                    {player.id === socket?.id && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded">Vous</span>}
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-cyan-400">{player.wpm} WPM</span>
                    <span className="text-slate-400">{Math.round(player.progress)}%</span>
                    {player.placement && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-sans">
                        #{player.placement} Place !
                      </span>
                    )}
                  </div>
                </div>

                {/* Track Lane with Moving Avatar */}
                <div className="relative h-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center px-2">
                  <div className="absolute right-3 top-0 bottom-0 flex items-center text-xs font-black text-emerald-400 opacity-60">
                    🏁 ARRIVÉE
                  </div>

                  {/* Progress filler */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-500/20 to-cyan-500/40 border-r-2 border-cyan-400 transition-all duration-300"
                    style={{ width: `${player.progress}%` }}
                  />

                  {/* Moving Player Icon */}
                  <div
                    className="absolute transition-all duration-300 text-xl z-10 filter drop-shadow-md"
                    style={{ left: `calc(${Math.min(92, player.progress)}%)` }}
                  >
                    {player.avatar}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Typing Canvas during Racing */}
          {currentRoom.status === 'racing' && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-slate-950 border-2 border-cyan-500 rounded-2xl p-4 text-lg font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                value={userInput}
                onChange={handleTypeChange}
                placeholder="Tapez le texte ci-dessous le plus vite possible !"
                autoFocus
              />

              {/* Text display */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-base leading-relaxed break-words select-none">
                {currentRoom.text.split('').map((char, idx) => {
                  const isTyped = idx < userInput.length;
                  const isCurrent = idx === userInput.length;

                  let charStyle = 'text-slate-500';
                  if (isTyped) charStyle = 'text-emerald-400 font-bold';
                  if (isCurrent) charStyle = 'text-slate-950 bg-cyan-400 font-bold animate-pulse px-0.5 rounded-xs';

                  return (
                    <span key={idx} className={charStyle}>
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live In-Room Chat */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare size={14} className="text-cyan-400" /> Chat en direct du salon
          </div>

          <div ref={chatScrollRef} className="h-32 bg-slate-950 p-3 rounded-xl border border-slate-800/80 overflow-y-auto space-y-2 text-xs font-mono">
            {chatMessages.length > 0 ? (
              chatMessages.map((msg) => (
                <div key={msg.id} className="leading-relaxed">
                  <span className="font-bold text-cyan-400">{msg.senderName}: </span>
                  <span className="text-slate-200">{msg.text}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center pt-8">
                Envoyez un message pour discuter avec les autres coureurs !
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Tapez un message..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Lobby view (Select nickname / avatar / rooms list)
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400">
            <span>🏁</span> Compétition Multijoueur en Temps Réel
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Affrontez d'autres dactylographes en direct
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            Rejoignez une course publique ou créez votre propre salon privé avec code d'accès pour défier vos amis.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 p-4 rounded-2xl text-xs font-bold text-center animate-bounce">
          {errorMessage}
        </div>
      )}

      {/* User Profile Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users size={18} className="text-cyan-400" /> Votre Profil de Coureur
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Pseudo :</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Avatar de Course :</label>
            <div className="flex gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`
                    w-10 h-10 rounded-xl border text-lg flex items-center justify-center transition-all
                    ${avatar === emoji
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 scale-110 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'}
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions: Create Room vs Join Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Room Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" /> Créer un Salon de Course
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Nom du Salon :</label>
              <input
                type="text"
                placeholder={`Course de ${nickname}`}
                value={createRoomName}
                onChange={(e) => setCreateRoomName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="privateCheck"
                checked={createIsPrivate}
                onChange={(e) => setCreateIsPrivate(e.target.checked)}
                className="accent-cyan-500"
              />
              <label htmlFor="privateCheck" className="text-xs font-semibold text-slate-300 cursor-pointer">
                Salon privé avec code PIN
              </label>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Texte sur mesure (optionnel) :</label>
              <textarea
                rows={2}
                placeholder="Laissez vide pour un texte aléatoire..."
                value={createCustomText}
                onChange={(e) => setCreateCustomText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              Créer le salon
            </button>
          </div>
        </div>

        {/* Join Private Room Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock size={18} className="text-amber-400" /> Rejoindre par Code PIN
          </h3>

          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Entrez le code PIN à 4 chiffres communiqué par l'hôte du salon privé.
            </p>

            <input
              type="text"
              placeholder="Ex: 4821"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-mono font-bold text-center text-amber-400 tracking-widest focus:outline-none focus:border-amber-500"
            />

            <button
              disabled={!joinCodeInput.trim()}
              onClick={() => {
                // Find private room or try code
                const targetRoom = publicRooms.find((r) => r.id === joinCodeInput.trim());
                if (targetRoom) {
                  handleJoinRoom(targetRoom.id, joinCodeInput);
                } else {
                  // Direct join attempt
                  handleJoinRoom(joinCodeInput.trim(), joinCodeInput.trim());
                }
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              Rejoindre avec le code
            </button>
          </div>
        </div>
      </div>

      {/* Public Rooms List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy size={18} className="text-cyan-400" /> Salons Publics Disponibles
          </span>
          <span className="text-xs text-slate-400 font-mono">{publicRooms.length} Salons</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publicRooms.length > 0 ? (
            publicRooms.map((room) => (
              <div key={room.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white">{room.name}</div>
                  <div className="text-xs text-slate-400">{room.textTitle}</div>
                  <div className="text-[11px] font-mono text-cyan-400 mt-1">
                    {room.playerCount}/{room.maxPlayers} Joueurs | Statut: {room.status}
                  </div>
                </div>

                <button
                  disabled={room.status !== 'waiting' || room.playerCount >= room.maxPlayers}
                  onClick={() => handleJoinRoom(room.id)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  Rejoindre
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-xs text-slate-500">
              Aucun salon public actif pour le moment. Soyez le premier à créer une course !
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
