import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Builder, By, until } from "selenium-webdriver";
import edge from "selenium-webdriver/edge.js";
import ffmpegPath from "ffmpeg-static";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = process.env.APP_URL || "http://localhost:5000";
const outputDirectory = path.join(root, "recordings");
const outputPath = path.resolve(
  process.env.RECORDING_PATH ||
    path.join(outputDirectory, `demo-walkthrough-${new Date().toISOString().replace(/[:.]/g, "-")}.mp4`)
);
const demoEmail = "demo@traffic.ai";
const demoPassword = "Demo@123";
const clientTestEmail = process.env.CLIENT_TEST_EMAIL;
const clientTestPassword = process.env.CLIENT_TEST_PASSWORD;
if (Boolean(clientTestEmail) !== Boolean(clientTestPassword)) {
  throw new Error("Set both CLIENT_TEST_EMAIL and CLIENT_TEST_PASSWORD to use a separate client account.");
}
const tabs = [
  "Command Center",
  "Connected Vehicle Safety",
  "Traffic Map",
  "AI Agent Center",
  "Traffic Monitoring",
  "Parking Management",
  "Violations",
  "ML Detection",
  "Illegal Parking AI",
  "Encroachment Monitor",
  "Emergency",
  "Analytics",
  "Daily Reports",
  "Road Intelligence"
];
const citizenTabs = [
  "Smart City & Pedestrian Shield",
  "Book Parking",
  "My Bookings",
  "My Fines",
  "Report Violation",
  "Report Road Issue",
  "Road News"
];
const specialHeadings = {
  "Encroachment Monitor": "Encroachment & Obstruction",
  Emergency: "AI Green Corridor",
  Analytics: "Traffic Analytics & Insights"
};

async function captureState(driver, directory, firstFrame, holdMilliseconds = 500) {
  const frameCount = Math.max(1, Math.ceil(holdMilliseconds / 500));

  for (let frame = 0; frame < frameCount; frame += 1) {
    const screenshot = Buffer.from(await driver.takeScreenshot(), "base64");
    const filename = path.join(directory, `frame-${String(firstFrame + frame).padStart(6, "0")}.png`);
    await writeFile(filename, screenshot);
    if (frame < frameCount - 1) await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return firstFrame + frameCount;
}

async function createVideo(framesDirectory, destination) {
  if (!ffmpegPath) throw new Error("The bundled FFmpeg executable is unavailable.");

  const ffmpeg = spawn(ffmpegPath, [
    "-y",
    "-framerate", "2",
    "-i", path.join(framesDirectory, "frame-%06d.png"),
    "-vf", "fps=30,pad=ceil(iw/2)*2:ceil(ih/2)*2,format=yuv420p",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-movflags", "+faststart",
    destination
  ], { stdio: ["ignore", "ignore", "pipe"] });

  let stderr = "";
  ffmpeg.stderr.setEncoding("utf8");
  ffmpeg.stderr.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-4000);
  });

  const exitCode = await new Promise((resolve, reject) => {
    ffmpeg.once("error", reject);
    ffmpeg.once("close", resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`FFmpeg failed with exit code ${exitCode}: ${stderr}`);
  }
}

const frameDirectory = await mkdtemp(path.join(tmpdir(), "traffic-selenium-"));
let driver;
let frameCount = 0;

try {
  const options = new edge.Options();
  options.addArguments("--new-window", "--start-maximized", "--disable-gpu");

  const edgeBinary = process.env.EDGE_BINARY || [
    process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe")
  ].find((candidate) => candidate && existsSync(candidate));
  if (edgeBinary) options.setBinaryPath(edgeBinary);

  driver = await new Builder()
    .forBrowser("MicrosoftEdge")
    .setEdgeOptions(options)
    .build();
  await driver.manage().window().maximize();

  await driver.get(baseUrl);
  await driver.wait(until.elementLocated(By.css(".google-button")), 15000);
  frameCount = await captureState(driver, frameDirectory, frameCount, 1500);
  await driver.findElement(By.css(".google-button")).click();
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    if (new URL(currentUrl).hostname === "accounts.google.com") return true;
    const body = await driver.findElement(By.css("body")).getText();
    if (body.includes("Google OAuth is not configured")) {
      throw new Error("Google OAuth is not configured on the server.");
    }
    return false;
  }, 15000);
  console.log("Google OAuth redirect verified");
  frameCount = await captureState(driver, frameDirectory, frameCount, 1500);

  await driver.get(baseUrl);
  const emailInput = await driver.wait(until.elementLocated(By.css('input[name="email"]')), 15000);

  await emailInput.sendKeys(demoEmail);
  await driver.findElement(By.css('input[name="password"]')).sendKeys(demoPassword);
  frameCount = await captureState(driver, frameDirectory, frameCount, 1500);
  await driver.findElement(By.css(".primary-button")).click();
  await driver.wait(async () => {
    const logoutButtons = await driver.findElements(By.css(".logout-button"));
    if (logoutButtons.length > 0) return true;
    const errors = await driver.findElements(By.css(".notice.error"));
    if (errors.length > 0) throw new Error(`Demo sign-in failed: ${await errors[0].getText()}`);
    return false;
  }, 15000);
  frameCount = await captureState(driver, frameDirectory, frameCount, 1000);

  for (const tab of tabs) {
    const navigationButtons = await driver.findElements(By.css(".command-nav button"));
    let targetButton;
    for (const button of navigationButtons) {
      if ((await button.getText()).trim() === tab) {
        targetButton = button;
        break;
      }
    }
    assert.ok(targetButton, `Dashboard tab "${tab}" was not found.`);
    await targetButton.click();
    await driver.wait(async () => {
      const activeButton = await driver.findElement(By.css(".command-nav button.active"));
      return (await activeButton.getText()).trim() === tab;
    }, 10000);

    if (tab === "Traffic Monitoring") {
      await driver.wait(until.elementLocated(By.css(".live-feed")), 10000);
    } else {
      const expectedHeading = specialHeadings[tab] || tab;
      await driver.wait(async () => {
        const headings = await driver.findElements(By.css(".command-content h1"));
        for (const heading of headings) {
          if ((await heading.getText()).trim() === expectedHeading) return true;
        }
        return false;
      }, 10000);
    }

    console.log(`Showing ${tab}`);
    frameCount = await captureState(driver, frameDirectory, frameCount, 1000);
  }

  await driver.findElement(By.css(".logout-button")).click();
  await driver.wait(until.elementLocated(By.css('input[name="email"]')), 15000);
  const userPortalButton = await driver.findElement(By.css(".portal-tabs button:nth-child(2)"));
  await userPortalButton.click();
  await driver.wait(async () => (await userPortalButton.getAttribute("class")).includes("active"), 5000);
  frameCount = await captureState(driver, frameDirectory, frameCount, 1000);

  await driver.findElement(By.css('input[name="email"]')).sendKeys(clientTestEmail || demoEmail);
  await driver.findElement(By.css('input[name="password"]')).sendKeys(clientTestPassword || demoPassword);
  frameCount = await captureState(driver, frameDirectory, frameCount, 1500);
  await driver.findElement(By.css(".primary-button")).click();
  await driver.wait(async () => {
    const logoutButtons = await driver.findElements(By.css(".logout-button"));
    if (logoutButtons.length > 0) return true;
    const errors = await driver.findElements(By.css(".notice.error"));
    if (errors.length > 0) throw new Error(`User portal sign-in failed: ${await errors[0].getText()}`);
    return false;
  }, 15000);
  console.log("User portal sign-in completed");
  await driver.wait(until.elementLocated(By.css(".citizen-shell")), 10000);
  await driver.wait(until.elementLocated(By.css(".traffic-map-page")), 10000);
  frameCount = await captureState(driver, frameDirectory, frameCount, 1000);

  for (const tab of citizenTabs) {
    const navigationButtons = await driver.findElements(By.css(".citizen-nav button"));
    let targetButton;
    for (const button of navigationButtons) {
      if ((await button.getText()).trim() === tab) {
        targetButton = button;
        break;
      }
    }
    assert.ok(targetButton, `Citizen portal tab "${tab}" was not found.`);
    await targetButton.click();
    await driver.wait(async () => {
      const activeButton = await driver.findElement(By.css(".citizen-nav button.active"));
      return (await activeButton.getText()).trim() === tab;
    }, 10000);

    if (tab === "Smart City & Pedestrian Shield") {
      await driver.findElement(By.xpath("//button[contains(., 'Request extended walk phase')]")).click();
    }
    if (tab === "Book Parking") {
      await driver.findElement(By.css(".parking-space .citizen-secondary-button")).click();
    }

    console.log(`Showing citizen ${tab}`);
    frameCount = await captureState(driver, frameDirectory, frameCount, 1000);
  }

  assert.ok(frameCount > 1, "The browser recording did not capture enough frames.");
  await mkdir(path.dirname(outputPath), { recursive: true });
  await createVideo(frameDirectory, outputPath);
  console.log(`Recording saved to ${outputPath}`);
} finally {
  if (driver) await driver.quit();
  await rm(frameDirectory, { recursive: true, force: true });
}
