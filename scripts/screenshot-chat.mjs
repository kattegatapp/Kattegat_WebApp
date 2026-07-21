import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";
const email = process.env.KATTEGAT_EMAIL ?? "ngwangshalom956@gmail.com";
const password = process.env.KATTEGAT_PASSWORD ?? "Fernando422@:00";
const outDir = ".cursor-screenshots";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
await page.fill("#memberEmail", email);
await page.fill("#memberPassword", password);
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForURL(/\/account/, { timeout: 30000 });

// Open chat via sidebar
await page.getByRole("button", { name: /chat room/i }).click();
await page.waitForTimeout(1500);

await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: `${outDir}/chat-desktop.png`, fullPage: false });

const mobile = await browser.newContext({ ...devices["Pixel 7"] });
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
await mobilePage.fill("#memberEmail", email);
await mobilePage.fill("#memberPassword", password);
await mobilePage.getByRole("button", { name: /sign in/i }).click();
await mobilePage.waitForURL(/\/account/, { timeout: 30000 });
const menuButton = mobilePage.getByRole("button", { name: /open menu/i });
if (await menuButton.isVisible().catch(() => false)) {
  await menuButton.click();
}
await mobilePage.getByRole("button", { name: /chat room/i }).click();
await mobilePage.waitForTimeout(1500);
await mobilePage.screenshot({ path: `${outDir}/chat-mobile-android.png`, fullPage: false });

await browser.close();
console.log("Screenshots saved to", outDir);
