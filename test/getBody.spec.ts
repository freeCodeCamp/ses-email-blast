/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, describe, it } from "vitest";
import { getBody } from "../src/modules/getBody.js";

describe("get Body", () => {
  it("should read the email body from file", async() => {
    expect.assertions(1);
    const filepath = path.join(process.cwd(), "prod", "/emailBody.txt");
    await writeFile(filepath, "This is a test");
    await expect(getBody(), "Did not correctly read email body.").resolves.toBe(
      "This is a test",
    );
    await unlink(filepath);
  });

  it("should return empty string on missing emailBody.txt", async() => {
    expect.assertions(1);
    await expect(getBody(), "Did not return an empty string.").resolves.toBe(
      "",
    );
  });
});
