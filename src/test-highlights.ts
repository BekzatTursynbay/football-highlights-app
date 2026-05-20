import "dotenv/config";
import { runHighlights } from "./index";

const manualMode = process.argv.includes("--manual");

runHighlights({ manualMode })
  .then(() => {
    console.log("✅ Test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
