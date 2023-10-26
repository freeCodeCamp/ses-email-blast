import path from "path";

import { assert } from "chai";
import { remove, writeFile } from "fs-extra";

import { getBody } from "../src/modules/getBody";

suite("Get Body", () => {
  test("should read the email body from file", async () => {
    const filepath = path.join(__dirname + "/../src/emailBody.txt");
    await writeFile(filepath, "This is a test");
    assert.equal(
      await getBody(),
      "This is a test",
      "Did not correctly read email body."
    );
    await remove(filepath);
  });

  test("should return empty string on missing emailBody.txt", async () => {
    assert.equal(await getBody(), "", "Did not return an empty string.");
  });
});
