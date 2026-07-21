import { mkdir } from "node:fs/promises";
import { chromium, devices } from "playwright";

const BASE = process.env.BASE_URL ?? "http://192.168.30.9:3001";
const EMAIL = process.env.KATTEGAT_EMAIL ?? "ngwangshalom956@gmail.com";
const PASSWORD = process.env.KATTEGAT_PASSWORD ?? "Fernando422@:00";
const OUT = ".cursor-screenshots";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(account|chat)/, { timeout: 30000 });
}

async function openChat(page) {
  await page.goto(`${BASE}/account`, { waitUntil: "networkidle" });
  const chatNav = page.getByRole("button", { name: /^Chat$/i }).or(page.getByRole("link", { name: /^Chat$/i }));
  if (await chatNav.count()) {
    await chatNav.first().click();
  } else {
    await page.goto(`${BASE}/chat`, { waitUntil: "networkidle" });
  }
  await page.waitForTimeout(1500);
}

async function screenshotChat(name, contextFactory) {
  const context = await browser.newContext(contextFactory());
  const page = await context.newPage();
  try {
    await login(page);
    await openChat(page);
    await page.screenshot({ path: `${OUT}/${name}-list.png`, fullPage: false });
    const thread = page.locator(".account-chat-list button").first();
    if (await thread.count()) {
      await thread.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${OUT}/${name}-thread.png`, fullPage: false });
    }
  } finally {
    await context.close();
  }
}

await screenshotChat("chat-desktop", () => ({ viewport: { width: 1280, height: 800 } }));
await screenshotChat("chat-mobile", () => devices["Pixel 7"]);

console.log("Screenshots saved to", OUT);
await browser.close();
