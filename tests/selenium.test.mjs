import test from "node:test";
import assert from "node:assert/strict";
import { Builder, By, until } from "selenium-webdriver";
import edge from "selenium-webdriver/edge.js";

const baseUrl = process.env.APP_URL || "http://localhost:5000";

test("demo login opens the dashboard and logout returns to sign in", async () => {
  const options = new edge.Options();
  options.setBinaryPath("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe");
  options.addArguments("--headless=new", "--window-size=1440,900", "--disable-gpu");

  const driver = await new Builder()
    .forBrowser("MicrosoftEdge")
    .setEdgeOptions(options)
    .build();

  try {
    await driver.get(baseUrl);

    await driver.wait(until.elementLocated(By.css('input[name="email"]')), 10000);
    await driver.findElement(By.css('input[name="email"]')).sendKeys("demo@traffic.ai");
    await driver.findElement(By.css('input[name="password"]')).sendKeys("Demo@123");
    await driver.findElement(By.css(".primary-button")).click();

    const logoutButton = await driver.wait(
      until.elementLocated(By.css(".logout-button")),
      10000
    );
    assert.match(await logoutButton.getText(), /logout/i);

    await logoutButton.click();
    await driver.wait(until.elementLocated(By.css('input[name="email"]')), 10000);
    assert.equal(await driver.findElement(By.css('input[name="email"]')).isDisplayed(), true);
  } finally {
    await driver.quit();
  }
});
