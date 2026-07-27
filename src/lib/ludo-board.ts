// Real 15x15 Ludo board engine. Two players (You=Red, AI=Yellow), 4 tokens each.
// Position 0 = base. 1..51 = ring. 52..57 = home column. 58 = finished (center).

export type PlayerId = "you" | "ai";
export type Token = { pos: number };

export type Match = {
  tokens: { you: Token[]; ai: Token[] };
  turn: PlayerId;
  lastRoll: number | null;
  consecutiveSixes: number;
  finished: boolean;
  winner: PlayerId | null;
  captures: { you: number; ai: number };
  events: string[];
  awaitingMove: boolean; // true after a roll while waiting for token selection
};

// 52 ring cells clockwise, starting at Red's entry (6,1).
export const PATH: ReadonlyArray<readonly [number, number]> = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0],
];

export const START_INDEX: Record<PlayerId, number> = { you: 0, ai: 26 };
// Safe cells on the ring (index into PATH): starting cells + classic star cells
export const SAFE_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);

// Home column cells for each player (5 cells before center)
export const HOME_COLS: Record<PlayerId, ReadonlyArray<readonly [number, number]>> = {
  you: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  ai: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
};

export const CENTER: readonly [number, number] = [7, 7];
export const FINISH_POS = 58;

// Base slot positions (row, col) for the 4 tokens when in home base
export const BASE_SLOTS: Record<PlayerId, ReadonlyArray<readonly [number, number]>> = {
  you: [
    [1.5, 1.5], [1.5, 3.5],
    [3.5, 1.5], [3.5, 3.5],
  ],
  ai: [
    [10.5, 10.5], [10.5, 12.5],
    [12.5, 10.5], [12.5, 12.5],
  ],
};

export function initialMatch(): Match {
  return {
    tokens: {
      you: [{ pos: 0 }, { pos: 0 }, { pos: 0 }, { pos: 0 }],
      ai: [{ pos: 0 }, { pos: 0 }, { pos: 0 }, { pos: 0 }],
    },
    turn: "you",
    lastRoll: null,
    consecutiveSixes: 0,
    finished: false,
    winner: null,
    captures: { you: 0, ai: 0 },
    events: [],
    awaitingMove: false,
  };
}

export function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

// Absolute (row,col) for a token position, or null if in base
export function cellFor(player: PlayerId, pos: number): { row: number; col: number } | null {
  if (pos === 0) return null;
  if (pos >= FINISH_POS) return { row: CENTER[0], col: CENTER[1] };
  if (pos <= 51) {
    const idx = (START_INDEX[player] + pos - 1) % 52;
    const [r, c] = PATH[idx];
    return { row: r, col: c };
  }
  // Home column
  const step = pos - 52; // 0..5
  const [r, c] = HOME_COLS[player][step];
  return { row: r, col: c };
}

// Ring index (0..51) for a token that's on the ring, otherwise -1
function ringIndex(player: PlayerId, pos: number): number {
  if (pos < 1 || pos > 51) return -1;
  return (START_INDEX[player] + pos - 1) % 52;
}

// Count opponent tokens on a given absolute ring index
function ringOccupants(match: Match, player: PlayerId, ringIdx: number): number {
  let n = 0;
  for (const t of match.tokens[player]) {
    if (ringIndex(player, t.pos) === ringIdx) n++;
  }
  return n;
}

// Is there an opponent blockade (2+ tokens) on this ring index?
export function isOpponentBlockade(match: Match, player: PlayerId, ringIdx: number): boolean {
  const other: PlayerId = player === "you" ? "ai" : "you";
  return ringOccupants(match, other, ringIdx) >= 2;
}

// Would moving `tok` by `roll` be legal (respects blockades & overshoot)?
function isMoveLegal(match: Match, player: PlayerId, tokIdx: number, roll: number): boolean {
  const tok = match.tokens[player][tokIdx];
  if (tok.pos === FINISH_POS) return false;
  if (tok.pos === 0) {
    if (roll !== 6) return false;
    // Landing on own blockade at start? disallowed
    const startRing = ringIndex(player, 1);
    if (isOpponentBlockade(match, player, startRing)) return false;
    return true;
  }
  const target = tok.pos + roll;
  if (target > FINISH_POS) return false; // overshoot center
  // Check path — cannot cross an opponent blockade on the ring
  for (let step = 1; step <= roll; step++) {
    const p = tok.pos + step;
    if (p > 51) break; // entering home column — safe from blockades
    const r = ringIndex(player, p);
    if (r < 0) continue;
    // Cannot land on OR pass through opponent blockade
    if (isOpponentBlockade(match, player, r)) {
      // Passing through: block. Landing on: block.
      return false;
    }
  }
  return true;
}

// Which tokens can legally move with this roll?
export function movableTokens(match: Match, player: PlayerId, roll: number): number[] {
  const list: number[] = [];
  const toks = match.tokens[player];
  for (let i = 0; i < toks.length; i++) {
    if (isMoveLegal(match, player, i, roll)) list.push(i);
  }
  return list;
}

export function moveToken(
  prev: Match,
  player: PlayerId,
  tokenIdx: number,
  roll: number,
): { state: Match; captured: boolean; finishedToken: boolean } {
  const state: Match = {
    ...prev,
    tokens: {
      you: prev.tokens.you.map((t) => ({ ...t })),
      ai: prev.tokens.ai.map((t) => ({ ...t })),
    },
    captures: { ...prev.captures },
    events: prev.events.slice(-6),
  };
  const other: PlayerId = player === "you" ? "ai" : "you";
  const tok = state.tokens[player][tokenIdx];
  let captured = false;
  let finishedToken = false;

  if (tok.pos === 0 && roll === 6) {
    tok.pos = 1;
  } else if (tok.pos > 0 && tok.pos + roll <= FINISH_POS) {
    tok.pos += roll;
  }

  // Capture check: on ring, non-safe cell, land on SINGLE opponent token
  const myRing = ringIndex(player, tok.pos);
  if (myRing >= 0 && !SAFE_INDICES.has(myRing)) {
    const occ = ringOccupants(state, other, myRing);
    if (occ === 1) {
      // Only a lone opponent token gets captured (blockades already blocked landing)
      for (const ot of state.tokens[other]) {
        if (ringIndex(other, ot.pos) === myRing) {
          ot.pos = 0;
          state.captures[player] += 1;
          captured = true;
        }
      }
    }
  }

  if (tok.pos === FINISH_POS) finishedToken = true;

  // Win check
  if (state.tokens[player].every((t) => t.pos === FINISH_POS)) {
    state.finished = true;
    state.winner = player;
  }

  // Turn logic
  const bonus = roll === 6 || captured || finishedToken;
  const keepTurn = bonus;
  if (roll === 6) state.consecutiveSixes += 1;
  else state.consecutiveSixes = 0;

  state.awaitingMove = false;
  state.lastRoll = null;
  if (!state.finished && !keepTurn) state.turn = other;

  return { state, captured, finishedToken };
}

// AI picks the best token following PRD priority order:
// 1) Win, 2) Capture, 3) Escape danger, 4) Enter home col, 5) Safe zone,
// 6) Bring out (if <2 active), 7) Advance furthest.
export function aiChooseToken(match: Match, roll: number, lastMovedIdx: number = -1): number {
  const options = movableTokens(match, "ai", roll);
  if (options.length === 0) return -1;

  const activeAI = match.tokens.ai.filter((t) => t.pos > 0 && t.pos < FINISH_POS).length;
  const inBase = match.tokens.ai.filter((t) => t.pos === 0).length;

  let best = options[0];
  let bestScore = -Infinity;
  for (const i of options) {
    const t = match.tokens.ai[i];
    const newPos = t.pos === 0 ? 1 : t.pos + roll;
    const ring = ringIndex("ai", newPos);
    const onRing = ring >= 0;
    const onSafe = onRing && SAFE_INDICES.has(ring);
    let s = 0;

    // P1: Win
    if (newPos === FINISH_POS) s += 100000;

    // P2: Capture
    if (onRing && !onSafe) {
      for (const yt of match.tokens.you) {
        const yr = ringIndex("you", yt.pos);
        if (yr === ring) {
          const occ = match.tokens.you.filter((x) => ringIndex("you", x.pos) === ring).length;
          if (occ === 1) s += 10000 + yt.pos * 10;
        }
      }
    }

    // P3: Escape danger
    if (t.pos > 0 && t.pos < 52) {
      const curRing = ringIndex("ai", t.pos);
      const curSafe = curRing >= 0 && SAFE_INDICES.has(curRing);
      const curOwn = match.tokens.ai.filter((x) => ringIndex("ai", x.pos) === curRing).length;
      if (!curSafe && curOwn < 2) {
        for (const yt of match.tokens.you) {
          if (yt.pos <= 0 || yt.pos >= 52) continue;
          const yr = ringIndex("you", yt.pos);
          for (let d = 1; d <= 6; d++) {
            const nr = (yr + d) % 52;
            if (nr === curRing) { s += 1500; break; }
          }
        }
      }
    }

    // P4: Enter home column
    if (newPos >= 52 && newPos < FINISH_POS) s += 800;

    // P5: Safe zone
    if (onSafe) s += 400;

    // P6: Bring new token out — stronger weight to spread across tokens
    if (t.pos === 0 && roll === 6) {
      if (activeAI === 0) s += 2000;
      else if (activeAI < 2) s += 900;
      else if (inBase >= 2) s += 500;
      else s += 150;
    }

    // Diversification: penalize moving the same token repeatedly if others are viable
    if (i === lastMovedIdx && options.length > 1) s -= 250;

    // Prefer tokens that are behind (spread progress) — small nudge
    const otherActive = match.tokens.ai.filter((x, j) => j !== i && x.pos > 0 && x.pos < FINISH_POS);
    if (otherActive.length > 0 && t.pos > 0) {
      const avgOther = otherActive.reduce((a, x) => a + x.pos, 0) / otherActive.length;
      if (t.pos > avgOther) s -= 40; // discourage always pushing the leader
    }

    // Avoid landing on a cell where opponent can hit us next turn (1..6)
    if (onRing && !onSafe && newPos < 52) {
      for (const yt of match.tokens.you) {
        if (yt.pos <= 0 || yt.pos >= 52) continue;
        const yr = ringIndex("you", yt.pos);
        for (let d = 1; d <= 6; d++) {
          if ((yr + d) % 52 === ring) { s -= 300; break; }
        }
      }
    }

    // P7: Advance
    s += newPos;

    if (s > bestScore) {
      bestScore = s;
      best = i;
    }
  }
  return best;
}

// Total score = sum of token positions (for tie-break on timer expiry)
export function playerScore(match: Match, player: PlayerId): number {
  return match.tokens[player].reduce((a, t) => a + t.pos, 0);
}

export function winnerByScore(match: Match): PlayerId | "tie" {
  const y = playerScore(match, "you");
  const a = playerScore(match, "ai");
  if (y === a) return "tie";
  return y > a ? "you" : "ai";
}
