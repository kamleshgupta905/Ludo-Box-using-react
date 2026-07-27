// Ludo Supreme engine: 1 token per player, 2 players (You vs AI), points-based race.
// Position semantics:
//   0        = in base (not yet on track)
//   1..52    = on the shared main track (each player has their own absolute start offset)
//   53..57   = home stretch (private)
//   58       = finished / home
//
// Absolute cell on shared track = ((startOffset + relPos - 1) mod 52) + 1
// Safe cells (absolute): 1 (own start), 9, 14, 22, 27, 35, 40, 48
// Rolling a 6 grants an extra turn (up to 3 in a row); three 6s in a row are void.

export const START_OFFSET = { you: 0, ai: 26 } as const;
export const HOME_FINISH = 58;
export const SAFE_ABS_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48]);

export type PlayerId = "you" | "ai";

export type TokenState = {
  pos: number; // 0 base, 1..52 track, 53..57 home stretch, 58 finished
};

export type MatchState = {
  you: TokenState;
  ai: TokenState;
  turn: PlayerId;
  consecutiveSixes: number;
  events: string[]; // recent human-readable log
  finished: boolean;
  winner: PlayerId | null;
  captures: { you: number; ai: number };
};

export function initialMatch(): MatchState {
  return {
    you: { pos: 0 },
    ai: { pos: 0 },
    turn: "you",
    consecutiveSixes: 0,
    events: [],
    finished: false,
    winner: null,
    captures: { you: 0, ai: 0 },
  };
}

export function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

// Absolute cell on shared 52-track for a given player relative position (must be 1..52)
export function absCell(playerId: PlayerId, relPos: number): number {
  const off = START_OFFSET[playerId];
  return ((off + relPos - 1) % 52) + 1;
}

// Legal move: returns the new relative position, or null if roll is invalid (overshoot home).
export function computeMove(pos: number, roll: number): number | null {
  if (pos === 0) {
    // Any roll enters (Zupee Supreme style)
    return roll; // 1..6 lands on relative pos 1..6
  }
  const next = pos + roll;
  if (next > HOME_FINISH) return null; // overshoot — must stay
  return next;
}

// Score/points shown to user = relative position (0..58)
export function score(pos: number): number {
  return pos;
}

// Applies a resolved move to state (mutating a fresh copy).
export function applyMove(
  prev: MatchState,
  playerId: PlayerId,
  roll: number,
): { state: MatchState; captured: boolean; entered: boolean; moved: boolean } {
  const state: MatchState = {
    ...prev,
    you: { ...prev.you },
    ai: { ...prev.ai },
    captures: { ...prev.captures },
    events: prev.events.slice(-8),
  };
  const meKey = playerId;
  const otherKey: PlayerId = playerId === "you" ? "ai" : "you";
  const me = state[meKey];
  const opp = state[otherKey];

  const newPos = computeMove(me.pos, roll);
  let moved = false;
  let entered = false;
  let captured = false;

  if (newPos === null) {
    state.events.push(
      `${playerId === "you" ? "You" : "AI"} rolled ${roll} — need exact roll to finish.`,
    );
  } else {
    if (me.pos === 0) entered = true;
    me.pos = newPos;
    moved = true;

    // Check capture: only on main track (1..52), and not on a safe cell
    if (newPos >= 1 && newPos <= 52 && opp.pos >= 1 && opp.pos <= 52) {
      const myAbs = absCell(meKey, newPos);
      const oppAbs = absCell(otherKey, opp.pos);
      if (myAbs === oppAbs && !SAFE_ABS_CELLS.has(myAbs)) {
        opp.pos = 0;
        state.captures[meKey] += 1;
        captured = true;
        state.events.push(
          `${playerId === "you" ? "You" : "AI"} captured ${playerId === "you" ? "AI" : "You"}! Sent to base.`,
        );
      }
    }

    if (newPos === HOME_FINISH) {
      state.finished = true;
      state.winner = playerId;
      state.events.push(`${playerId === "you" ? "You" : "AI"} reached home! Winner!`);
    }
  }

  // Turn / bonus logic
  if (state.finished) {
    return { state, captured, entered, moved };
  }

  let keepTurn = false;
  if (roll === 6) {
    state.consecutiveSixes += 1;
    if (state.consecutiveSixes >= 3) {
      state.events.push("Three sixes — turn forfeited.");
      state.consecutiveSixes = 0;
    } else {
      keepTurn = true;
    }
  } else {
    state.consecutiveSixes = 0;
  }

  if (captured) keepTurn = true; // bonus turn on capture

  if (!keepTurn) {
    state.turn = otherKey;
  }

  return { state, captured, entered, moved };
}

// Smart AI: single token, so it always rolls; nothing to choose.
// This function decides whether AI would use a "reroll" if we ever add one — for now returns immediately.
export function aiShouldRoll(_: MatchState): boolean {
  return true;
}

// Determine winner when timer expires
export function winnerByScore(state: MatchState): PlayerId | "tie" {
  const y = score(state.you.pos);
  const a = score(state.ai.pos);
  if (y === a) return "tie";
  return y > a ? "you" : "ai";
}
