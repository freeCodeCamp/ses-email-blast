/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, describe, it } from "vitest";
import { getValid } from "../src/modules/getValid.js";
import type { EmailInt } from "../src/interfaces/emailInt.js";

describe("getValid", () => {
  it("should return a list of emails", async() => {
    expect.assertions(4);
    const filePath = path.join(process.cwd(), "prod", "validEmails.csv");
    await writeFile(
      filePath,
      `email,unsubscribeId\nnhcarrigan@gmail.com,1\nnaomi@freecodecamp.org,2`,
    );
    const result = await getValid();
    const expected: Array<EmailInt> = [
      { email: "nhcarrigan@gmail.com", unsubscribeId: "1" },
      { email: "naomi@freecodecamp.org", unsubscribeId: "2" },
    ];
    expect(Array.isArray(result), "is not an array").toBeTruthy();
    expect(result, "does not have correct length").toHaveLength(2);
    expect(result[0], "does not have correct first entry").toStrictEqual(
      expected[0],
    );
    expect(result[1], "does not have correct second entry").toStrictEqual(
      expected[1],
    );
    await unlink(filePath);
  });

  it("should return empty array on missing file", async() => {
    expect.assertions(2);
    const result = await getValid();
    expect(Array.isArray(result), "is not an array").toBeTruthy();
    expect(result, "does not have correct length").toHaveLength(0);
  });
});
