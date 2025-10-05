// === SERVER.JS FINAL (VPS Ready, Metrics Enabled) ===
const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs-extra");
const multer = require("multer");
const { Server } = require("socket.io");
const JsConfuser = require("js-confuser");
const chalk = require("chalk");
const os = require("os");
const { execSync } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// === DIRECTORIES ===
const UPLOAD_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "output");
fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(OUTPUT_DIR);

// === STATIC FILES ===
app.use(express.static(path.join(__dirname, "public")));

// === LOGGER ===
function log(...args) {
  console.log(chalk.blue.bold("[WEB-OBF]"), ...args);
}

// === MULTER STORAGE ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + safe);
  },
});
const upload = multer({ storage });

// === ROUTES ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Upload handler (optional direct upload route)
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.json({ ok: false, error: "No file uploaded" });
  res.json({ ok: true, filename: req.file.filename });
});

// Download result
app.get("/download/:name", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.name);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");
  res.download(filePath);
});

// === METRICS ENDPOINT ===
app.get("/metrics", (req, res) => {
  try {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const ramPercent = Math.round((used / total) * 100);

    const load = os.loadavg()[0].toFixed(2);
    const uptimeMin = Math.floor(os.uptime() / 60);

    let diskPercent = null;
    try {
      const out = execSync("df -h --output=pcent / | tail -1 || true")
        .toString()
        .trim();
      const m = out.match(/(\d+)%/);
      if (m) diskPercent = parseInt(m[1], 10);
    } catch (e) {
      diskPercent = null;
    }

    res.json({
      cpuLoad: load,
      ramPercent,
      uptimeMin,
      diskPercent,
      loadAvg: load,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// Obfuscation configurations
// =========================

function getUltraSafeConfig() {
  return {
    target: "node",
    calculator: true,
    compact: true,
    hexadecimalNumbers: true,
    controlFlowFlattening: 1,
    deadCode: 1,
    dispatcher: true,
    duplicateLiteralsRemoval: 1,
    flatten: true,
    globalConcealing: true,
    identifierGenerator: "zeroWidth",
    renameVariables: true,
    renameGlobals: true,
    minify: true,
    movedDeclarations: true,
    objectExtraction: true,
    opaquePredicates: 0.75,
    stringConcealing: true,
    stringCompression: true,
    stringEncoding: true,
    stringSplitting: 0.75,
    rgf: false,
  };
}

function getNebulaObfuscationConfig() {
  const generateNebulaName = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const prefix = "NX";
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
      randomPart += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${prefix}${randomPart}`;
  };

  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateNebulaName,
    stringCompression: true,
    stringConcealing: false,
    stringEncoding: true,
    stringSplitting: false,
    controlFlowFlattening: 1,
    flatten: true,
    shuffle: true,
    rgf: true,
    deadCode: true,
    opaquePredicates: true,
    dispatcher: true,
    globalConcealing: true,
    objectExtraction: true,
    duplicateLiteralsRemoval: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true,
    },
  };
}

function getNovaObfuscationConfig() {
  const generateNovaName = () => {
    return "var_" + Math.random().toString(36).substring(7);
  };
  return {
    target: "node",
    calculator: false,
    compact: true,
    controlFlowFlattening: 1,
    deadCode: 1,
    dispatcher: true,
    duplicateLiteralsRemoval: 1,
    flatten: true,
    globalConcealing: true,
    hexadecimalNumbers: 1,
    identifierGenerator: generateNovaName,
    lock: {
      antiDebug: true,
      integrity: true,
      selfDefending: true,
    },
    minify: true,
    movedDeclarations: true,
    objectExtraction: true,
    opaquePredicates: true,
    renameGlobals: true,
    renameVariables: true,
    shuffle: true,
    stack: true,
    stringCompression: true,
    stringConcealing: true,
  };
}

function getArabObfuscationConfig() {
  const arabicChars = [
    "أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ",
    "ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي",
  ];

  const generateArabicName = () => {
    const length = Math.floor(Math.random() * 4) + 3;
    let name = "";
    for (let i = 0; i < length; i++) {
      name += arabicChars[Math.floor(Math.random() * arabicChars.length)];
    }
    return name;
  };

  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: () => generateArabicName(),
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 1,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true,
    },
  };
}

function getJapanxArabObfuscationConfig() {
  const japaneseXArabChars = [
    "あ","い","う","え","お","か","き","く","け","こ","さ","し","す","せ","そ",
    "た","ち","つ","て","と","な","に","ぬ","ね","の","は","ひ","ふ","へ","ほ",
    "ま","み","む","め","も","や","ゆ","よ","أ","ب","ت","ث","ج","ح","خ","د","ذ",
    "ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي",
    "ら","り","る","れ","ろ","わ","を","ん",
  ];
  const generateJapaneseXArabName = () => {
    const length = Math.floor(Math.random() * 4) + 3;
    let name = "";
    for (let i = 0; i < length; i++) {
      name += japaneseXArabChars[Math.floor(Math.random() * japaneseXArabChars.length)];
    }
    return name;
  };
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: () => generateJapaneseXArabName(),
    stringCompression: true,
    stringConcealing: true,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 1,
    flatten: true,
    shuffle: true,
    rgf: false,
    dispatcher: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true,
    },
  };
}

function getJapanObfuscationConfig() {
  const japaneseChars = [
    "あ","い","う","え","お","か","き","く","け","こ","さ","し","す","せ","そ",
    "た","ち","つ","て","と","な","に","ぬ","ね","の","は","ひ","ふ","へ","ほ",
    "ま","み","む","め","も","や","ゆ","よ","ら","り","る","れ","ろ","わ","を","ん",
  ];
  const generateJapaneseName = () => {
    const length = Math.floor(Math.random() * 4) + 3;
    let name = "";
    for (let i = 0; i < length; i++) {
      name += japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
    }
    return name;
  };

  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: () => generateJapaneseName(),
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 1,
    flatten: true,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true,
    },
  };
}

// =========================
// Anti-bypass / password template
// =========================

const TByypas = `(async () => {
  const fs = require("fs");
  const path = require("path");
  const C = require("chalk");
  const A = require("axios");
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
  let mainFile;
  if (pkg.main) {
    mainFile = path.resolve(process.cwd(), pkg.main);
  } else if (pkg.scripts && pkg.scripts.start) {
    const parts = pkg.scripts.start.split(" ");
    mainFile = path.resolve(process.cwd(), parts[parts.length - 1]);
  } else {
    mainFile = process.argv[1];
  }
  const snapshot = fs.readFileSync(mainFile, "utf8");
  setInterval(() => {
    try {
      const now = fs.readFileSync(mainFile, "utf8");
      if (snapshot !== now) {
        console.log(C.redBright("[ ⚠️ ] File sedang dirombak!"));
        process.abort();
      }
    } catch (e) {}
  }, 2000);
  if (A.interceptors && A.interceptors.request && A.interceptors.request.handlers && A.interceptors.request.handlers.length > 0) {
    console.log(C.redBright("[ ⚠️ ] Axios interceptor detected!"));
    process.abort();
  }
  try { Object.freeze(A); Object.seal(A); } catch(e) {}
})();`;

function createPasswordTemplate(encodedPassword, originalCode) {
  return `${TByypas}
(async () => {
const readline = require('readline');
const chalk = require('chalk');
const passwordBuffer = Buffer.from('${encodedPassword}', 'base64');
const correctPassword = passwordBuffer.toString('utf8');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
console.clear();
console.log(chalk.bold.red("🔑 MASUKKAN PASSWORD:"));
rl.question('> ', (inputPassword) => {
  if (inputPassword !== correctPassword) {
    console.log(chalk.bold.red("❌ PASSWORD SALAH"));
    process.exit(1);
  }
${originalCode}
  rl.close();
});
})();`;
}

// =========================
// Helper obfuscation functions
// =========================

/**
 * Obfuscate code with JsConfuser and write to output file.
 * Returns the output filename on success.
 */
async function obfuscateAndWrite(code, config, prefix = "enc_") {
  const result = await JsConfuser.obfuscate(code, config);
  let obfCode;
  if (typeof result === "string") obfCode = result;
  else if (result && typeof result.code === "string") obfCode = result.code;
  else if (result && typeof result.toString === "function") obfCode = result.toString();
  else obfCode = JSON.stringify(result);

  const outFile = `${prefix}${Date.now()}.js`;
  const outPath = path.join(OUTPUT_DIR, outFile);
  await fs.writeFile(outPath, obfCode, "utf8");
  return outFile;
}

/**
 * Wrap code with anti-bypass prefix and obfuscate then write to output.
 * If password is provided, it creates the password template first.
 */
async function obfuscateWithOptions({ code, presetConfig, addAntiBypass = false, password = null, identifierPrefix = "enc_" }) {
  let baseCode = code;
  if (addAntiBypass) {
    baseCode = `${TByypas}\n${code}`;
  }

  if (password) {
    const encodedPassword = Buffer.from(password).toString("base64");
    baseCode = createPasswordTemplate(encodedPassword, baseCode);
    // ensure extra protection use ultra config by default for password wrapper
    presetConfig = presetConfig || getUltraSafeConfig();
  }

  const outFile = await obfuscateAndWrite(baseCode, presetConfig, identifierPrefix);
  return outFile;
}

// =========================
// Socket.IO HANDLER
// =========================

io.on("connection", (socket) => {
  log("Client connected:", socket.id);

  socket.on("disconnect", () => log("Client disconnected:", socket.id));

  /**
   * start payload:
   * { file: "uploaded_filename.js", preset: "nova|nebula|arab|japan|xa|ultra|nova|japanxarab", password: optional string, antibypass: boolean }
   */
  socket.on("start", async (data) => {
    try {
      const { file, preset, password, antibypass } = data || {};
      const src = path.join(UPLOAD_DIR, file);
      if (!file || !fs.existsSync(src)) {
        socket.emit("error", { message: "File tidak ditemukan." });
        return;
      }

      socket.emit("progress", { status: "Menganalisis file...", percent: 10 });

      let code = await fs.readFile(src, "utf8");
      socket.emit("progress", { status: "Memilih konfigurasi...", percent: 25 });

      // map preset to config
      const getConfigByPreset = (p) => {
        switch ((p || "").toLowerCase()) {
          case "nova":
            return getNovaObfuscationConfig();
          case "nebula":
            return getNebulaObfuscationConfig();
          case "arab":
            return getArabObfuscationConfig();
          case "japan":
            return getJapanObfuscationConfig();
          case "japanxarab":
          case "japan_x_arab":
            return getJapanxArabObfuscationConfig();
          case "ultra":
            return getUltraSafeConfig();
          case "xa":
            // 'xa' uses some default heavy config similar to nova but with string splitting
            return Object.assign({}, getNovaObfuscationConfig(), { stringSplitting: true, calculator: true });
          default:
            // default fallback config
            return { target: "node", controlFlowFlattening: 1, renameGlobals: true };
        }
      };

      const config = getConfigByPreset(preset);

      socket.emit("progress", { status: "Mengaburkan kode...", percent: 45 });

      // perform obfuscation (with optional antibypass or password wrapper)
      socket.emit("progress", { status: antibypass ? "Menambahkan AntiBypass..." : "Memproses obfuscation...", percent: 60 });

      const outFile = await obfuscateWithOptions({
        code,
        presetConfig: config,
        addAntiBypass: !!antibypass,
        password: password || null,
        identifierPrefix: `enc_${Date.now()}_`,
      });

      socket.emit("progress", { status: "Menulis hasil...", percent: 90 });

      socket.emit("done", { filename: outFile, download: `/download/${outFile}` });
      socket.emit("progress", { status: "Selesai!", percent: 100 });

      log(chalk.green("✔ Obfuscation selesai untuk:"), file);
    } catch (err) {
      log(chalk.red("Error pada obfuscation:"), err);
      socket.emit("error", { message: err?.message || String(err) });
    }
  });
});

// === START SERVER ===
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  log(`Server running at http://${HOST}:${PORT}`);
  log("Press Ctrl+C to stop.");
});