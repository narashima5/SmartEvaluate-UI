import QRCode from "qrcode";
import fs from "fs";
import path from "path";

import { mockTeams } from "./src/data/mockData.ts";

const outputDir = path.join(process.cwd(), "qrcodes");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

mockTeams.forEach(async (team) => {
  try {
    const filename = path.join(outputDir, `${team.id}.png`);
    await QRCode.toFile(filename, JSON.stringify({ id: team.id }), {
      color: {
        dark: "#000000", // Black for maximum contrast
        light: "#ffffff", // White
      },
      width: 500, // Larger width for dense data
      errorCorrectionLevel: "L", // Low error correction to reduce density
      margin: 4, // Standard margin
    });
    console.log(`Generated QR code for ${team.id} at ${filename}`);
  } catch (err) {
    console.error(`Error generating QR code for ${team.id}:`, err);
  }
});
