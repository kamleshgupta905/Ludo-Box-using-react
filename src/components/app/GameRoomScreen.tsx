import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScreenHeader } from "./ScreenHeader";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, Flag, Loader2, Timer, Coins } from "lucide-react";
import { toast } from "sonner";
import {
  initialMatch,
  moveToken,
  rollDie,
  movableTokens,
  aiChooseToken,
  playerScore,
  winnerByScore,
  cellFor,
  BASE_SLOTS,
  HOME_COLS,
  PATH,
  SAFE_INDICES,
  FINISH_POS,
  type Match,
  type PlayerId,
} from "@/lib/ludo-board";
import { aiOpponents } from "@/lib/demo-data";
import {
  startMusic,
  stopMusic,
  setMuted,
  sfxDice,
  sfxMove,
  sfxCapture,
  sfxFinish,
  sfxWin,
  sfxLose,
} from "@/lib/sounds";

const MATCH_SECONDS = 180;
const HOP_MS = 160;

// pip positions for dice faces 1..6 (grid 3x3, values 0..2)
const PIP_POSITIONS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[1, 1]],
  [[0, 0], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 0], [0, 2], [2, 0], [2, 2]],
  [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
];

function DiceFace({ value, size = 76 }: { value: number; size?: number }) {
  const v = Math.min(6, Math.max(1, value));
  const pips = PIP_POSITIONS[v - 1];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label={`Dice ${v}`}>
      <rect x="4" y="4" width="92" height="92" rx="20" fill="white" stroke="#111" strokeWidth="5" />
      {pips.map(([r, c], i) => (
        <circle key={i} cx={22 + c * 28} cy={22 + r * 28} r="8.5" fill="#111" />
      ))}
    </svg>
  );
}

// Colors
const RED = "#E74C3C";
const BLUE = "#3498DB";
const GREEN = "#27AE60";
const YELLOW = "#F39C12";

type Anim = {
  player: PlayerId;
  tokenIdx: number;
  fromPos: number;
  step: number; // current hop, 1..total
  total: number; // total hops (visual)
  roll: number; // original dice roll to commit to engine
};

export function GameRoomScreen() {
  const setScreen = useApp((s) => s.setScreen);
  const currentTable = useApp((s) => s.currentTable);
  const finishGame = useApp((s) => s.finishGame);
  const user = useApp((s) => s.user);
  const soundOn = useApp((s) => s.settings.sound);
  const updateSettings = useApp((s) => s.updateSettings);

  const [match, setMatch] = useState<Match>(() => initialMatch());
  const [dice, setDice] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [pendingRoll, setPendingRoll] = useState<number | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [matchTime, setMatchTime] = useState(MATCH_SECONDS);
  const [opponent] = useState(() => aiOpponents[Math.floor(Math.random() * aiOpponents.length)]);
  const [anim, setAnim] = useState<Anim | null>(null);
  const [flash, setFlash] = useState<{ player: PlayerId; idx: number } | null>(null);
  const [sparkle, setSparkle] = useState<{ row: number; col: number } | null>(null);
  const [captureFx, setCaptureFx] = useState<{ row: number; col: number } | null>(null);
  const matchStartRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const rollsSinceSix = useRef<{ you: number; ai: number }>({ you: 0, ai: 0 });
  const totalCaptures = useRef(0);
  const lastAiTokenIdx = useRef<number>(-1);
  const busy = rolling || anim !== null || captureFx !== null;

  const label = currentTable?.label ?? "Practice";
  const entry = currentTable?.entry ?? 0;
  const prize = currentTable?.prize ?? 0;
  const pot = entry * 2; // 2 players
  const platformFee = Math.max(0, pot - prize); // 10% typically

  // Init audio: start ambient music, sync mute with settings
  useEffect(() => {
    setMuted(!soundOn);
    if (soundOn) startMusic();
    return () => stopMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    setMuted(!soundOn);
    if (soundOn) startMusic();
    else stopMusic();
  }, [soundOn]);

  const yourMovable = useMemo(
    () => (pendingRoll && match.turn === "you" && !busy ? movableTokens(match, "you", pendingRoll) : []),
    [match, pendingRoll, busy],
  );

  const endMatch = useCallback(
    (winner: PlayerId | "tie") => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const durationSec = Math.max(1, Math.round((Date.now() - matchStartRef.current) / 1000));
      const won = winner === "you";
      if (soundOn) (won ? sfxWin : sfxLose)();
      stopMusic();
      finishGame({
        mode: label,
        entry,
        prize,
        won,
        myScore: playerScore(match, "you"),
        aiScore: playerScore(match, "ai"),
        opponent,
        durationSec,
      });
      setTimeout(() => setScreen("gameResult"), 700);
    },
    [finishGame, label, entry, prize, match, opponent, setScreen, soundOn],
  );

  // Match timer
  useEffect(() => {
    if (match.finished) return;
    const id = setInterval(() => {
      setMatchTime((t) => {
        if (t <= 1) {
          clearInterval(id);
          endMatch(winnerByScore(match));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [match, endMatch]);

  // React to game finish
  useEffect(() => {
    if (match.finished && match.winner) endMatch(match.winner);
  }, [match.finished, match.winner, endMatch]);

  // Hop-by-hop animator: on each step tick, advance step counter until total,
  // then commit real state via moveToken.
  useEffect(() => {
    if (!anim) return;
    if (anim.step < anim.total) {
      const id = setTimeout(() => {
        setAnim((a) => (a ? { ...a, step: a.step + 1 } : a));
      }, HOP_MS);
      return () => clearTimeout(id);
    }
    // Commit
    const id = setTimeout(() => {
      const roll = anim.roll;
      const before = match;
      const other: PlayerId = anim.player === "you" ? "ai" : "you";
      const { state, captured, finishedToken } = moveToken(before, anim.player, anim.tokenIdx, roll);
      if (anim.player === "ai") lastAiTokenIdx.current = anim.tokenIdx;
      if (captured) totalCaptures.current += 1;

      if (captured) {
        // Find captured opponent token & the collision cell
        let capIdx = -1;
        for (let i = 0; i < before.tokens[other].length; i++) {
          if (before.tokens[other][i].pos !== 0 && state.tokens[other][i].pos === 0) {
            capIdx = i;
            break;
          }
        }
        const movedTok = state.tokens[anim.player][anim.tokenIdx];
        const collision = cellFor(anim.player, movedTok.pos);

        if (capIdx >= 0 && collision) {
          // Phase 1: apply the mover's landing but KEEP the captured token on the cell
          const phase1: Match = {
            ...state,
            tokens: {
              you: state.tokens.you.map((t, i) =>
                other === "you" && i === capIdx ? { pos: before.tokens.you[i].pos } : t,
              ),
              ai: state.tokens.ai.map((t, i) =>
                other === "ai" && i === capIdx ? { pos: before.tokens.ai[i].pos } : t,
              ),
            },
          };
          setMatch(phase1);
          setAnim(null);
          setFlash({ player: other, idx: capIdx });
          setCaptureFx({ row: collision.row, col: collision.col });
          if (soundOn) sfxCapture();
          if (anim.player === "you") toast("🔥 Captured! Bonus turn.");
          else toast("😬 AI captured your token!");
          // Phase 2: after flash, send captured token home
          setTimeout(() => {
            setMatch(state);
            setFlash(null);
            setCaptureFx(null);
          }, 700);

          if (finishedToken) {
            const c = cellFor(anim.player, FINISH_POS);
            if (c) {
              setSparkle({ row: c.row, col: c.col });
              setTimeout(() => setSparkle(null), 900);
            }
          }
          return;
        }
      }

      if (finishedToken) {
        const c = cellFor(anim.player, FINISH_POS);
        if (c) {
          setSparkle({ row: c.row, col: c.col });
          setTimeout(() => setSparkle(null), 900);
        }
        if (soundOn) sfxFinish();
        toast(`${anim.player === "you" ? "Your" : "AI"} token reached home! 🎉`);
      } else if (soundOn) {
        sfxMove();
      }

      setMatch(state);
      setAnim(null);
    }, HOP_MS);
    return () => clearTimeout(id);
  }, [anim, match, soundOn]);

  const startMove = useCallback(
    (player: PlayerId, tokenIdx: number, roll: number) => {
      const tok = match.tokens[player][tokenIdx];
      const from = tok.pos;
      // From base: land in one hop on entry cell (pos 1)
      const hops = from === 0 ? 1 : roll;
      setAnim({ player, tokenIdx, fromPos: from, step: 1, total: hops, roll });
    },
    [match],
  );

  // Biased roller: guarantees a 6 within every 5 rolls per player, and nudges
  // toward capture-enabling rolls when the game has had fewer than 2 captures.
  const smartRoll = useCallback(
    (who: PlayerId): number => {
      // Guarantee 6 within 5 rolls
      if (rollsSinceSix.current[who] >= 4) {
        rollsSinceSix.current[who] = 0;
        return 6;
      }
      // Nudge toward capture rolls if match under-captured
      if (totalCaptures.current < 2) {
        const captureRolls: number[] = [];
        for (let r = 1; r <= 6; r++) {
          const opts = movableTokens(match, who, r);
          for (const i of opts) {
            const t = match.tokens[who].map((x) => ({ ...x }))[i];
            const newPos = t.pos === 0 ? 1 : t.pos + r;
            if (newPos < 1 || newPos > 51) continue;
            // Check if lands on lone opponent, non-safe (inline logic)
            const off = who === "you" ? 0 : 26;
            const ring = (off + newPos - 1) % 52;
            if (SAFE_INDICES.has(ring)) continue;
            const other: PlayerId = who === "you" ? "ai" : "you";
            const otherOff = other === "you" ? 0 : 26;
            const opp = match.tokens[other].filter(
              (x) => x.pos >= 1 && x.pos <= 51 && (otherOff + x.pos - 1) % 52 === ring,
            );
            if (opp.length === 1) { captureRolls.push(r); break; }
          }
        }
        if (captureRolls.length > 0 && Math.random() < 0.55) {
          const pick = captureRolls[Math.floor(Math.random() * captureRolls.length)];
          if (pick === 6) rollsSinceSix.current[who] = 0;
          else rollsSinceSix.current[who] += 1;
          return pick;
        }
      }
      const r = rollDie();
      if (r === 6) rollsSinceSix.current[who] = 0;
      else rollsSinceSix.current[who] += 1;
      return r;
    },
    [match],
  );

  const doRoll = useCallback(async () => {
    if (busy || match.finished || pendingRoll !== null) return;
    setRolling(true);
    if (soundOn) sfxDice();
    const spinDur = 700;
    const start = Date.now();
    while (Date.now() - start < spinDur) {
      setDice(1 + Math.floor(Math.random() * 6));
      await new Promise((r) => setTimeout(r, 70));
    }
    const who: PlayerId = match.turn;
    const roll = smartRoll(who);
    setDice(roll);
    setRolling(false);

    // Third consecutive six → forfeit BEFORE moving
    if (roll === 6 && match.consecutiveSixes >= 2) {
      toast("❌ Three 6s! Turn Lost!");
      setMatch({
        ...match,
        consecutiveSixes: 0,
        turn: who === "you" ? "ai" : "you",
        awaitingMove: false,
        lastRoll: null,
        events: [...match.events.slice(-5), `${who === "you" ? "You" : opponent} rolled 3 sixes — turn lost.`],
      });
      return;
    }

    const options = movableTokens(match, who, roll);

    if (options.length === 0) {
      if (who === "you") {
        if (roll === 6) toast("🎲 Six! But no valid moves.");
        else toast(`⏭️ Rolled ${roll} — no moves.`);
      }
      const next: Match = {
        ...match,
        consecutiveSixes: roll === 6 ? match.consecutiveSixes + 1 : 0,
        turn: who === "you" ? "ai" : "you",
        awaitingMove: false,
        lastRoll: null,
        events: [...match.events.slice(-5), `${who === "you" ? "You" : opponent} rolled ${roll} — no move.`],
      };
      setMatch(next);
      return;
    }

    if (who === "you") {
      if (roll === 6) toast("🎲 Six! Bonus turn after moving.");
      // Auto-move if only one option, OR if all movable options are still in
      // base (equivalent choice — no need to force a tap on tiny targets).
      const allInBase = options.every((i) => match.tokens.you[i].pos === 0);
      if (options.length === 1 || allInBase) {
        startMove("you", options[0], roll);
      } else {
        setPendingRoll(roll);
        toast("Tap a glowing token to move.");
      }
    } else {
      const idx = aiChooseToken(match, roll, lastAiTokenIdx.current);
      startMove("ai", idx, roll);
    }
  }, [match, busy, pendingRoll, opponent, startMove, soundOn, smartRoll]);

  // AI auto-plays
  useEffect(() => {
    if (match.finished || match.turn !== "ai" || busy || pendingRoll !== null) return;
    setAiThinking(true);
    const t = setTimeout(() => {
      setAiThinking(false);
      void doRoll();
    }, 1100);
    return () => clearTimeout(t);
  }, [match.turn, match.finished, busy, pendingRoll, doRoll]);

  const handleTokenClick = (tokenIdx: number) => {
    if (pendingRoll === null || match.turn !== "you" || busy) return;
    if (!yourMovable.includes(tokenIdx)) return;
    const roll = pendingRoll;
    setPendingRoll(null);
    startMove("you", tokenIdx, roll);
  };

  const forfeit = () => {
    if (match.finished) return;
    endMatch("ai");
  };

  const yourScore = playerScore(match, "you");
  const aiScore = playerScore(match, "ai");
  const yourFinished = match.tokens.you.filter((t) => t.pos === FINISH_POS).length;
  const aiFinished = match.tokens.ai.filter((t) => t.pos === FINISH_POS).length;

  const canRoll = !busy && !match.finished && match.turn === "you" && pendingRoll === null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#0b0f19]">
      <ScreenHeader
        title={label}
        right={
          <button
            onClick={() => updateSettings({ sound: !soundOn })}
            className="grid h-10 w-10 place-items-center rounded-full bg-card"
            aria-label={soundOn ? "Mute" : "Unmute"}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </button>
        }
      />

      {/* Pot / prize strip — shows platform fee (10%) and winner takes 90% */}
      {entry > 0 && (
        <div className="mx-3 mt-2 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-[10px]">
          <span className="flex items-center gap-1 font-bold text-muted-foreground">
            <Coins className="h-3 w-3 text-primary" /> Pot ₹{pot}
          </span>
          <span className="text-muted-foreground">Fee 10% (₹{platformFee})</span>
          <span className="font-display text-[11px] text-primary">Winner ₹{prize}</span>
        </div>
      )}

      {/* Top status: players + timer */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pt-2">
        <PlayerBadge
          name={user.name.split(" ")[0]}
          color={RED}
          score={yourScore}
          finished={yourFinished}
          active={match.turn === "you"}
        />
        <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-card px-2 py-1.5">
          <Timer className="h-3.5 w-3.5 text-primary" />
          <p className="font-display text-sm tabular-nums">{formatTime(matchTime)}</p>
        </div>
        <PlayerBadge
          name={opponent}
          color={YELLOW}
          score={aiScore}
          finished={aiFinished}
          active={match.turn === "ai"}
          thinking={aiThinking}
          rightAlign
        />
      </div>

      {/* Turn banner */}
      <div className="px-3 pt-2">
        <div
          className={cn(
            "flex items-center justify-center rounded-full py-1.5 text-[11px] font-bold uppercase tracking-wider",
            match.turn === "you"
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-amber-500/15 text-amber-400",
          )}
        >
          {match.finished
            ? "Match Over"
            : match.turn === "you"
              ? pendingRoll
                ? `Rolled ${pendingRoll} — pick a glowing token`
                : "Your turn — roll the dice"
              : aiThinking
                ? "🤖 AI is thinking…"
                : "AI's turn"}
        </div>
      </div>

      {/* Board */}
      <div className="flex flex-1 items-center justify-center px-2 py-2">
        <LudoBoard
          match={match}
          movable={yourMovable}
          onTokenClick={handleTokenClick}
          pendingRoll={pendingRoll}
          anim={anim}
          flash={flash}
          sparkle={sparkle}
          captureFx={captureFx}
        />
      </div>

      {/* Dice + controls */}
      <div className="border-t border-border bg-card/80 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={forfeit}
            className="flex items-center gap-1 rounded-full border border-destructive/50 px-3 py-2 text-xs font-bold text-destructive"
          >
            <Flag className="h-3.5 w-3.5" /> Forfeit
          </button>

          <button
            onClick={() => void doRoll()}
            disabled={!canRoll}
            className={cn(
              "relative grid h-24 w-24 place-items-center rounded-3xl border-4 border-primary bg-white shadow-glow transition-all",
              canRoll ? "hover:scale-105 active:scale-95 animate-pulse" : "opacity-60",
            )}
            aria-label="Roll dice"
            style={{ animationDuration: canRoll ? "2s" : undefined }}
          >
            <div
              className={cn(rolling && "animate-spin")}
              style={{ transformStyle: "preserve-3d" }}
            >
              <DiceFace value={dice} size={76} />
            </div>
          </button>

          <div className="w-20 text-right text-[10px] leading-tight text-muted-foreground">
            <div className="font-bold text-foreground">
              You {yourFinished}/4
            </div>
            <div className="font-bold text-foreground">
              AI {aiFinished}/4
            </div>
            {pendingRoll && (
              <div className="mt-1 text-primary">Move: {pendingRoll}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function PlayerBadge({
  name,
  color,
  score,
  finished,
  active,
  thinking,
  rightAlign,
}: {
  name: string;
  color: string;
  score: number;
  finished: number;
  active: boolean;
  thinking?: boolean;
  rightAlign?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border p-2 transition-all",
        active ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-card",
        rightAlign && "flex-row-reverse text-right",
      )}
    >
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
        style={{ background: color }}
      >
        {name[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">{name}</p>
        <p className="text-[10px] text-muted-foreground">
          Score {score} • {finished}/4
        </p>
      </div>
      {thinking && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
    </div>
  );
}

/* ============================ Board ============================ */

function LudoBoard({
  match,
  movable,
  onTokenClick,
  pendingRoll,
  anim,
  flash,
  sparkle,
  captureFx,
}: {
  match: Match;
  movable: number[];
  onTokenClick: (i: number) => void;
  pendingRoll: number | null;
  anim: Anim | null;
  flash: { player: PlayerId; idx: number } | null;
  sparkle: { row: number; col: number } | null;
  captureFx: { row: number; col: number } | null;
}) {
  return (
    <div className="relative aspect-square w-full max-w-[min(94vw,460px)] overflow-hidden rounded-2xl border-4 border-[#1a2136] bg-white shadow-2xl">
      <svg viewBox="0 0 15 15" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Home base backgrounds */}
        <HomeBase x={0} y={0} color={RED} inner="#F5B7B1" />
        <HomeBase x={9} y={0} color={BLUE} inner="#AED6F1" />
        <HomeBase x={0} y={9} color={GREEN} inner="#A9DFBF" />
        <HomeBase x={9} y={9} color={YELLOW} inner="#FAD7A0" />

        {/* All path cells (white default) */}
        {renderRingCells()}

        {/* Home column cells (colored) */}
        {HOME_COLS.you.slice(0, 5).map(([r, c], i) => (
          <rect key={`hy-${i}`} x={c} y={r} width={1} height={1} fill={RED} stroke="#000" strokeWidth={0.02} />
        ))}
        {HOME_COLS.ai.slice(0, 5).map(([r, c], i) => (
          <rect key={`ha-${i}`} x={c} y={r} width={1} height={1} fill={YELLOW} stroke="#000" strokeWidth={0.02} />
        ))}
        {[[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]].map(([r, c], i) => (
          <rect key={`hb-${i}`} x={c} y={r} width={1} height={1} fill={BLUE} stroke="#000" strokeWidth={0.02} />
        ))}
        {[[9, 7], [10, 7], [11, 7], [12, 7], [13, 7]].map(([r, c], i) => (
          <rect key={`hg-${i}`} x={c} y={r} width={1} height={1} fill={GREEN} stroke="#000" strokeWidth={0.02} />
        ))}

        {/* Starting cells colored */}
        <rect x={PATH[0][1]} y={PATH[0][0]} width={1} height={1} fill={RED} opacity={0.35} stroke="#000" strokeWidth={0.02} />
        <rect x={PATH[13][1]} y={PATH[13][0]} width={1} height={1} fill={BLUE} opacity={0.35} stroke="#000" strokeWidth={0.02} />
        <rect x={PATH[26][1]} y={PATH[26][0]} width={1} height={1} fill={YELLOW} opacity={0.35} stroke="#000" strokeWidth={0.02} />
        <rect x={PATH[39][1]} y={PATH[39][0]} width={1} height={1} fill={GREEN} opacity={0.35} stroke="#000" strokeWidth={0.02} />

        {/* Safe stars */}
        {[...SAFE_INDICES].map((i) => (
          <StarMark key={`s-${i}`} x={PATH[i][1] + 0.5} y={PATH[i][0] + 0.5} />
        ))}

        {/* Center triangles (finish home) */}
        <g>
          <polygon points="6,6 9,6 7.5,7.5" fill={BLUE} stroke="#000" strokeWidth={0.03} />
          <polygon points="9,6 9,9 7.5,7.5" fill={YELLOW} stroke="#000" strokeWidth={0.03} />
          <polygon points="9,9 6,9 7.5,7.5" fill={GREEN} stroke="#000" strokeWidth={0.03} />
          <polygon points="6,9 6,6 7.5,7.5" fill={RED} stroke="#000" strokeWidth={0.03} />
        </g>

        {/* Sparkle burst when a token finishes */}
        {sparkle && <SparkleBurst row={sparkle.row} col={sparkle.col} />}

        {/* Capture burst on collision cell */}
        {captureFx && <CaptureBurst row={captureFx.row} col={captureFx.col} />}

        {/* Tokens */}
        {renderTokens(match, "you", movable, onTokenClick, pendingRoll, anim, flash)}
        {renderTokens(match, "ai", [], () => {}, null, anim, flash)}
      </svg>
    </div>
  );
}

function HomeBase({ x, y, color, inner }: { x: number; y: number; color: string; inner: string }) {
  return (
    <g>
      <rect x={x} y={y} width={6} height={6} fill={color} stroke="#000" strokeWidth={0.05} />
      <rect x={x + 1} y={y + 1} width={4} height={4} fill="white" stroke="#000" strokeWidth={0.04} />
      <rect x={x + 1.2} y={y + 1.2} width={3.6} height={3.6} fill={inner} />
      {[
        [x + 1.5, y + 1.5],
        [x + 3.5, y + 1.5],
        [x + 1.5, y + 3.5],
        [x + 3.5, y + 3.5],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={0.42} fill="white" stroke="#000" strokeWidth={0.03} />
      ))}
    </g>
  );
}

function StarMark({ x, y }: { x: number; y: number }) {
  const r1 = 0.28;
  const r2 = 0.12;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    pts.push(`${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`);
  }
  return <polygon points={pts.join(" ")} fill="#7f8c8d" opacity={0.65} />;
}

function SparkleBurst({ row, col }: { row: number; col: number }) {
  const cx = col + 0.5;
  const cy = row + 0.5;
  const rays = 8;
  return (
    <g>
      {Array.from({ length: rays }).map((_, i) => {
        const a = (i / rays) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={cx + Math.cos(a) * 0.6}
            cy={cy + Math.sin(a) * 0.6}
            r={0.1}
            fill="#FFD54F"
          >
            <animate attributeName="opacity" values="1;0" dur="0.8s" repeatCount="1" />
            <animate attributeName="r" values="0.15;0" dur="0.8s" repeatCount="1" />
          </circle>
        );
      })}
    </g>
  );
}

function CaptureBurst({ row, col }: { row: number; col: number }) {
  const cx = col + 0.5;
  const cy = row + 0.5;
  return (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r={0.45} fill="none" stroke="#ff2d2d" strokeWidth={0.12}>
        <animate attributeName="r" values="0.3;0.9" dur="0.7s" repeatCount="1" />
        <animate attributeName="opacity" values="1;0" dur="0.7s" repeatCount="1" />
        <animate attributeName="stroke-width" values="0.18;0.02" dur="0.7s" repeatCount="1" />
      </circle>
      <circle cx={cx} cy={cy} r={0.35} fill="#ff2d2d" opacity={0.4}>
        <animate attributeName="opacity" values="0.6;0" dur="0.5s" repeatCount="1" />
      </circle>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <circle key={i} cx={cx} cy={cy} r={0.08} fill="#ff2d2d">
            <animate attributeName="cx" from={cx} to={cx + Math.cos(a) * 0.9} dur="0.6s" repeatCount="1" />
            <animate attributeName="cy" from={cy} to={cy + Math.sin(a) * 0.9} dur="0.6s" repeatCount="1" />
            <animate attributeName="opacity" values="1;0" dur="0.6s" repeatCount="1" />
          </circle>
        );
      })}
    </g>
  );
}

function renderRingCells() {
  return PATH.map(([r, c], i) => (
    <rect
      key={`p-${i}`}
      x={c}
      y={r}
      width={1}
      height={1}
      fill="white"
      stroke="#000"
      strokeWidth={0.02}
    />
  ));
}

function renderTokens(
  match: Match,
  player: PlayerId,
  movable: number[],
  onClick: (i: number) => void,
  pendingRoll: number | null,
  anim: Anim | null,
  flash: { player: PlayerId; idx: number } | null,
) {
  const color = player === "you" ? RED : YELLOW;
  const toks = match.tokens[player];

  // Compute displayed position for each token accounting for animation
  const displayPos = toks.map((t, i) => {
    if (anim && anim.player === player && anim.tokenIdx === i) {
      // From base? first hop goes to pos 1
      if (anim.fromPos === 0) {
        return anim.step >= 1 ? 1 : 0;
      }
      return Math.min(FINISH_POS, anim.fromPos + anim.step);
    }
    return t.pos;
  });

  // Group tokens by cell to offset overlaps (based on display positions)
  const cellMap = new Map<string, number[]>();
  displayPos.forEach((p, i) => {
    if (p === 0) return;
    const c = cellFor(player, p);
    if (!c) return;
    const key = `${c.row},${c.col}`;
    if (!cellMap.has(key)) cellMap.set(key, []);
    cellMap.get(key)!.push(i);
  });

  return toks.map((_t, i) => {
    const p = displayPos[i];
    let cx: number;
    let cy: number;
    let onBoard = false;
    let hopping = anim && anim.player === player && anim.tokenIdx === i;

    if (p === 0) {
      const [br, bc] = BASE_SLOTS[player][i];
      cx = bc;
      cy = br;
    } else {
      const c = cellFor(player, p)!;
      onBoard = true;
      cx = c.col + 0.5;
      cy = c.row + 0.5;
      const key = `${c.row},${c.col}`;
      const arr = cellMap.get(key) ?? [i];
      if (arr.length > 1 && !hopping) {
        const idx = arr.indexOf(i);
        const off = 0.18;
        const angle = (idx / arr.length) * Math.PI * 2;
        cx += Math.cos(angle) * off;
        cy += Math.sin(angle) * off;
      }
    }

    const canMove = player === "you" && pendingRoll !== null && movable.includes(i) && !anim;
    const flashing = flash && flash.player === player && flash.idx === i;
    const fill = flashing ? "#ff2d2d" : color;

    return (
      <g
        key={`${player}-t-${i}`}
        onClick={() => canMove && onClick(i)}
        style={{
          cursor: canMove ? "pointer" : "default",
          transition: hopping ? `transform ${HOP_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)` : undefined,
        }}
      >
        {canMove && (
          <circle
            cx={cx}
            cy={cy}
            r={0.55}
            fill="none"
            stroke="#22c55e"
            strokeWidth={0.08}
            opacity={0.9}
          >
            <animate attributeName="r" values="0.5;0.62;0.5" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        {/* shadow */}
        <ellipse
          cx={cx + 0.03}
          cy={cy + (hopping ? 0.12 : 0.05)}
          rx={hopping ? 0.28 : (onBoard ? 0.34 : 0.36)}
          ry={hopping ? 0.14 : (onBoard ? 0.28 : 0.3)}
          fill="rgba(0,0,0,0.35)"
        />
        {/* token body — lift while hopping */}
        <g style={{ transform: hopping ? "translateY(-0.15px)" : undefined }}>
          <circle cx={cx} cy={cy} r={onBoard ? 0.34 : 0.36} fill={fill} stroke="#000" strokeWidth={0.05}>
            {flashing && (
              <animate attributeName="opacity" values="1;0.3;1;0.3;1" dur="0.5s" repeatCount="1" />
            )}
          </circle>
          <circle cx={cx - 0.08} cy={cy - 0.08} r={0.09} fill="rgba(255,255,255,0.7)" />
        </g>
        {/* Enlarged transparent hit target for mobile tapping */}
        {canMove && (
          <circle cx={cx} cy={cy} r={0.75} fill="rgba(0,0,0,0.001)" />
        )}
      </g>
    );
  });
}
