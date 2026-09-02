import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_SEATS,
  MESSAGE_TYPES,
  MultiplayerSession,
  PROTOCOL_VERSION,
  ProtocolError,
  encodeProtocolMessage,
  makeActionId,
  normalizePlayerName,
  normalizeRoomCode,
  parseProtocolMessage,
  validateLobby,
  validateSeatCount,
} from "../src/multiplayer.js";

function lobby(maxSeats = 3) {
  return {
    maxSeats,
    seats: Array.from({ length: maxSeats }, (_, seat) => seat === 0
      ? { seat, kind: "human", name: "Maja", connected: true, ready: true }
      : { seat, kind: "empty", name: "", connected: false, ready: false }),
  };
}

function openChannel() {
  return {
    readyState: "open",
    sent: [],
    send(packet) { this.sent.push(JSON.parse(packet)); },
    close() { this.readyState = "closed"; },
  };
}

test("room codes and names are normalized at the boundary", () => {
  assert.equal(normalizeRoomCode(" ab-cd23 "), "ABCD23");
  assert.equal(normalizePlayerName("  Puchaty   Lis  "), "Puchaty Lis");
  assert.throws(() => normalizeRoomCode("OOO111"), (error) => error instanceof ProtocolError && error.code === "INVALID_ROOM");
  assert.throws(() => normalizePlayerName(" "), /cannot be empty/i);
});

test("seat count is strictly limited to two through eight", () => {
  assert.equal(validateSeatCount(2), 2);
  assert.equal(validateSeatCount(MAX_SEATS), 8);
  assert.throws(() => validateSeatCount(1), /between 2 and 8/i);
  assert.equal(validateSeatCount(8), 8);
  assert.throws(() => validateSeatCount(9), /between 2 and 8/i);
  assert.throws(() => validateSeatCount(2.5), /between 2 and 8/i);
});

test("lobby validation rejects duplicate seats and connected bots", () => {
  assert.equal(validateLobby(lobby()).maxSeats, 3);
  const duplicate = lobby();
  duplicate.seats[2].seat = 1;
  assert.throws(() => validateLobby(duplicate), /duplicate seat/i);

  const bot = lobby();
  bot.seats[1] = { seat: 1, kind: "bot", name: "Bocik", connected: true, ready: true };
  assert.throws(() => validateLobby(bot), /bot seat cannot/i);
});

test("the explicit protocol recognizes every documented packet kind", () => {
  assert.deepEqual(MESSAGE_TYPES, [
    "hello", "welcome", "lobby", "start", "action", "state", "resolution", "error", "ping",
  ]);
  const room = lobby(2);
  const packets = [
    { type: "hello", protocol: PROTOCOL_VERSION, name: "Maja" },
    { type: "welcome", protocol: PROTOCOL_VERSION, seat: 1, lobby: room, revision: 0 },
    { type: "lobby", lobby: room, revision: 1 },
    { type: "start", revision: 2 },
    { type: "action", action: "choose-card", payload: { cardId: "tea-2" }, actionId: "peer:1", revision: 2 },
    { type: "state", state: { hand: ["tea-2"] }, revision: 3 },
    { type: "resolution", actionId: "peer:1", ok: true, result: { accepted: true }, revision: 3 },
    { type: "error", code: "ILLEGAL_ACTION", message: "Nie można zagrać tej karty." },
    { type: "ping", at: 1234, reply: false },
  ];
  for (const packet of packets) {
    assert.deepEqual(parseProtocolMessage(encodeProtocolMessage(packet)), packet);
  }
});

test("protocol parser rejects malformed, oversized and incompatible messages", () => {
  assert.throws(() => parseProtocolMessage("not-json"), (error) => error.code === "INVALID_JSON");
  assert.throws(() => parseProtocolMessage({ type: "cheat", state: {} }), (error) => error.code === "INVALID_MESSAGE");
  assert.throws(
    () => parseProtocolMessage({ type: "hello", protocol: 999, name: "Maja" }),
    (error) => error.code === "PROTOCOL_MISMATCH",
  );
  assert.throws(
    () => parseProtocolMessage({ type: "action", action: "x", actionId: "a:1", revision: -1, payload: {} }),
    (error) => error.code === "INVALID_ACTION",
  );
  assert.throws(
    () => parseProtocolMessage(JSON.stringify({ type: "state", revision: 1, state: "x".repeat(300_000) })),
    (error) => error.code === "MESSAGE_TOO_LARGE",
  );
});

test("action IDs are stable, monotonic helpers", () => {
  assert.equal(makeActionId("peer/one", 7), "peerone:7");
  assert.throws(() => makeActionId("peer", -1), /sequence/i);
});

test("host broadcasts a separately filtered view for every remote seat", () => {
  const source = {
    deck: ["secret-next-card"],
    players: [{ hand: ["host-card"] }, { hand: ["tea"] }, { hand: ["cake"] }],
  };
  const seenSeats = [];
  const session = new MultiplayerSession({
    filterState(state, seat) {
      seenSeats.push(seat);
      return {
        seat,
        hand: state.players[seat].hand,
        opponents: state.players.map((player, index) => index === seat ? null : player.hand.length),
      };
    },
  });
  session.role = "host";
  session.localSeat = 0;
  session.localName = "Maja";
  session.peerId = "host";
  session.lobby = lobby(3);
  const first = openChannel();
  const second = openChannel();
  session.peers.set("p1", { id: "p1", seat: 1, channel: first });
  session.peers.set("p2", { id: "p2", seat: 2, channel: second });

  assert.equal(session.broadcastViews(source), 1);
  assert.deepEqual(seenSeats, [1, 2]);
  assert.deepEqual(first.sent[0], {
    type: "state",
    revision: 1,
    state: { seat: 1, hand: ["tea"], opponents: [1, null, 1] },
  });
  assert.deepEqual(second.sent[0].state.hand, ["cake"]);
  assert.equal(JSON.stringify(first.sent).includes("secret-next-card"), false);
});

test("host refuses to broadcast without an explicit hidden-information filter", () => {
  const session = new MultiplayerSession();
  session.role = "host";
  assert.throws(
    () => session.broadcastViews({ deck: ["must-not-leak"] }),
    (error) => error.code === "FILTER_REQUIRED",
  );
});

test("a delayed resolution is routed back to the action's originating peer", () => {
  const session = new MultiplayerSession();
  session.role = "host";
  const channel = openChannel();
  session.peers.set("guest-1", { id: "guest-1", seat: 2, channel });
  session._actionOrigins.set("guest-1:4", "guest-1");
  session.resolveAction("guest-1:4", true, { points: 3 });
  assert.deepEqual(channel.sent[0], {
    type: "resolution",
    actionId: "guest-1:4",
    ok: true,
    revision: 0,
    result: { points: 3 },
  });
  assert.equal(session._actionOrigins.has("guest-1:4"), false);
});

test("guest ignores stale state revisions", () => {
  const states = [];
  const session = new MultiplayerSession({ onState: (state) => states.push(state) });
  session.role = "guest";
  session.localSeat = 1;
  session._acceptHostMessage({ type: "state", revision: 4, state: { turn: 4 } });
  session._acceptHostMessage({ type: "state", revision: 3, state: { turn: 3 } });
  session._acceptHostMessage({ type: "state", revision: 4, state: { turn: "duplicate" } });
  session._acceptHostMessage({ type: "state", revision: 5, state: { turn: 5 } });
  assert.deepEqual(states, [{ turn: 4 }, { turn: 5 }]);
  assert.equal(session.lastRevision, 5);
});

test("lobby configuration preserves humans and reserves bot seats", () => {
  const session = new MultiplayerSession();
  session.role = "host";
  session.localName = "Maja";
  session.localSeat = 0;
  session.peerId = "host";
  session.lobby = lobby(3);
  const remoteChannel = openChannel();
  session.lobby.seats[1] = { seat: 1, kind: "human", name: "Olek", connected: true, ready: true };
  session.peers.set("remote", { id: "remote", seat: 1, channel: remoteChannel });

  const configured = session.configureLobby({ botSeats: [{ seat: 2, name: "Kluska", difficulty: "hard" }] });
  assert.equal(configured.seats[1].name, "Olek");
  assert.deepEqual(configured.seats[2], {
    seat: 2,
    kind: "bot",
    name: "Kluska",
    connected: false,
    ready: true,
    difficulty: "hard",
  });
  assert.equal(remoteChannel.sent.at(-1).type, "lobby");
});
