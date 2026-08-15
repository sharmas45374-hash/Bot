const mineflayer = require("mineflayer");
const {
  pathfinder,
  Movements,
  goals
} = require("mineflayer-pathfinder");

const HOST = "SoulSMP12.aternos.me";
const PORT = 40740;

const BOT_USERNAME = "SKSHIVAM";
const BOT_PASSWORD = "QmZtRkLpXa";

let bot;
let reconnecting = false;
let activityTimer;

function createBot() {
  console.log("🔄 Connecting to SoulSMP...");

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: BOT_USERNAME,
    version: "1.21.11",
    auth: "offline"
  });

  bot.loadPlugin(pathfinder);

  bot.once("spawn", () => {
    console.log("✅ Bot joined SoulSMP!");

    const movements = new Movements(bot);
    movements.canDig = true;
    movements.allow1by1towers = false;

    bot.pathfinder.setMovements(movements);

    // Login
    setTimeout(() => {
      bot.chat(`/login ${BOT_PASSWORD}`);
    }, 2500);

    // Start activity
    setTimeout(startActivity, 6000);
  });

  // Automatic register/login
  bot.on("messagestr", message => {
    const msg = message.toLowerCase();

    if (
      msg.includes("register") ||
      msg.includes("please register")
    ) {
      setTimeout(() => {
        bot.chat(`/register ${BOT_PASSWORD} ${BOT_PASSWORD}`);
      }, 1000);
    }

    if (
      msg.includes("login") ||
      msg.includes("please login")
    ) {
      setTimeout(() => {
        bot.chat(`/login ${BOT_PASSWORD}`);
      }, 1000);
    }
  });

  bot.on("kicked", reason => {
    console.log("❌ Kicked:", reason);
    reconnect();
  });

  bot.on("end", () => {
    console.log("🔌 Disconnected!");
    reconnect();
  });

  bot.on("error", err => {
    console.log("⚠️ Error:", err.message);
  });
}

// -------------------------
// RANDOM WALK
// -------------------------

function randomWalk() {
  if (!bot?.entity) return;

  const pos = bot.entity.position;

  const x = pos.x + (Math.random() - 0.5) * 20;
  const z = pos.z + (Math.random() - 0.5) * 20;

  bot.pathfinder.setGoal(
    new goals.GoalNear(x, pos.y, z, 2)
  );

  console.log("🚶 Bot walking...");
}

// -------------------------
// RANDOM LOOK
// -------------------------

function randomLook() {
  if (!bot?.entity) return;

  const yaw = Math.random() * Math.PI * 2;
  const pitch = (Math.random() - 0.5) * 0.6;

  bot.look(yaw, pitch, true);

  console.log("👀 Looking around...");
}

// -------------------------
// RANDOM JUMP
// -------------------------

function randomJump() {
  if (!bot?.entity) return;

  bot.setControlState("jump", true);

  setTimeout(() => {
    if (bot) {
      bot.setControlState("jump", false);
    }
  }, 400);

  console.log("🦘 Jump!");
}

// -------------------------
// BREAK NEARBY BLOCK
// -------------------------

async function breakBlock() {
  if (!bot?.entity) return;

  const block = bot.findBlock({
    matching: block =>
      block &&
      block.diggable &&
      block.name !== "bedrock" &&
      block.name !== "air",
    maxDistance: 3
  });

  if (!block) return;

  try {
    console.log(`⛏️ Breaking ${block.name}...`);

    await bot.dig(block);

    console.log("✅ Block broken!");
  } catch (err) {
    console.log("⛏️ Couldn't break block.");
  }
}

// -------------------------
// RANDOM ACTIVITY
// -------------------------

function randomActivity() {
  if (!bot?.entity) return;

  const action = Math.floor(Math.random() * 4);

  switch (action) {
    case 0:
      randomWalk();
      break;

    case 1:
      randomLook();
      break;

    case 2:
      randomJump();
      break;

    case 3:
      breakBlock();
      break;
  }
}

// -------------------------
// START ACTIVITY
// -------------------------

function startActivity() {
  if (activityTimer) {
    clearInterval(activityTimer);
  }

  console.log("🟢 AFK activity started!");

  randomActivity();

  activityTimer = setInterval(() => {
    randomActivity();
  }, 7000 + Math.random() * 8000);
}

// -------------------------
// AUTO RECONNECT
// -------------------------

function reconnect() {
  if (reconnecting) return;

  reconnecting = true;

  if (activityTimer) {
    clearInterval(activityTimer);
    activityTimer = null;
  }

  console.log("⏳ Reconnecting in 10 seconds...");

  setTimeout(() => {
    reconnecting = false;
    createBot();
  }, 10000);
}

// -------------------------
// START BOT
// -------------------------

createBot();
