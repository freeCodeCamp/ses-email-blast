import { unlink, writeFile } from "fs/promises";
import path from "path";

import { assert, describe, test } from "vitest";

import { EmailInt } from "../src/interfaces/emailInt.js";
import { getValid } from "../src/modules/getValid.js";

describe("getValid", () => {
  test("should return a list of emails", async () => {
    const filePath = path.join(process.cwd(), "prod", "validEmails.csv");
    await writeFile(
      filePath,
      `email,unsubscribeId\nnhcarrigan@gmail.com,1\nnaomi@freecodecamp.org,2`
    );
    const result = await getValid();
    const expected: EmailInt[] = [
      { email: "nhcarrigan@gmail.com", unsubscribeId: "1" },
      { email: "naomi@freecodecamp.org", unsubscribeId: "2" }
    ];
    assert.isArray(result, "did not return an array");
    assert.deepEqual(result, expected, "did not return correct data");
    assert.deepEqual(
      result[0],
      expected[0],
      "did not return correct data for first entry"
    );
    assert.deepEqual(
      result[1],
      expected[1],
      "did not return correct data for second entry"
    );
    await unlink(filePath);
  });

  test("should return empty array on missing file", async () => {
    const result = await getValid();
    assert.isArray(result, "did not return an array");
    assert.equal(result.length, 0, "did not return an empty array");
  });
});
