const mineflayer = require("mineflayer");
const {
  pathfinder,
  Movements,
  goals
} = require("mineflayer-pathfinder");

const HOST = "SoulSMP12.aternos.me";
const PORT = 40740;

const BOT_USERNAME = "SKSHIVAM";
const BOT_PASSWORD = process.env.BOT_PASSWORD || "YOUR_PASSWORD";

let bot;
let reconnecting = false;

function createBot() {
  console.log("🤖 Connecting to SoulSMP...");

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

    // Login after joining
    setTimeout(() => {
      bot.chat(`/login ${BOT_PASSWORD}`);
    }, 2500);

    // Start normal activity
    setTimeout(() => {
      startActivity();
    }, 5000);
  });

  // Auth messages can sometimes arrive slightly later
  bot.on("messagestr", message => {
    const msg = message.toLowerCase();

    if (
      msg.includes("register") ||
      msg.includes("please register")
    ) {
      bot.chat(`/register ${BOT_PASSWORD} ${BOT_PASSWORD}`);
    }

    if (
      msg.includes("login") ||
      msg.includes("please login")
    ) {
      bot.chat(`/login ${BOT_PASSWORD}`);
    }
  });

  bot.on("kicked", reason => {
    console.log("❌ Kicked:", reason);
    reconnect();
  });

  bot.on("end", () => {
    console.log("🔌 Connection ended.");
    reconnect();
  });

  bot.on("error", err => {
    console.log("⚠️ Error:", err.message);
  });
}

function reconnect() {
  if (reconnecting) return;

  reconnecting = true;

  setTimeout(() => {
    reconnecting = false;
    createBot();
  }, 10000);
}

function randomWalk() {
  if (!bot || !bot.entity) return;

  const distance = 5 + Math.floor(Math.random() * 12);

  const x =
    bot.entity.position.x +
    (Math.random() - 0.5) * distance * 2;

  const z =
    bot.entity.position.z +
    (Math.random() - 0.5) * distance * 2;

  const y = bot.entity.position.y;

  bot.pathfinder.setGoal(
    new goals.GoalNear(x, y, z, 2)
  );

  console.log("🚶 Walking...");
}

function randomLook() {
  if (!bot || !bot.entity) return;

  const yaw = Math.random() * Math.PI * 2;
  const pitch = (Math.random() - 0.5) * 0.5;

  bot.look(yaw, pitch, true);
}

function randomJump() {
  if (!bot || !bot.entity) return;

  bot.setControlState("jump", true);

  setTimeout(() => {
    if (bot) bot.setControlState("jump", false);
  }, 300 + Math.random() * 500);
}

async function breakNearbyBlock() {
  if (!bot || !bot.entity) return;

  const block = bot.findBlock({
    matching: b =>
      b &&
      b.name !== "air" &&
      b.name !== "bedrock" &&
      b.diggable,
    maxDistance: 3
  });

  if (!block) return;

  try {
    console.log("⛏️ Breaking:", block.name);

    await bot.dig(block);

    console.log("✅ Block broken");
  } catch (err) {
    console.log("⛏️ Could not break block");
  }
}

function randomActivity() {
  if (!bot || !bot.entity) return;

  const action = Math.floor(Math.random() * 5);

  if (action === 0) randomWalk();
  if (action === 1) randomLook();
  if (action === 2) randomJump();
  if (action === 3) randomWalk();
  if (action === 4) breakNearbyBlock();
}

function startActivity() {
  console.log("🟢 Normal-player activity started.");

  randomActivity();

  setInterval(() => {
    randomActivity();
  }, 7000 + Math.random() * 8000);
}

// Start
createBot();
