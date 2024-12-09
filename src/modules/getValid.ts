/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
// eslint-disable-next-line @typescript-eslint/naming-convention
import Spinnies from "spinnies";
import type { EmailInt } from "../interfaces/emailInt.js";

const spinnies = new Spinnies({
  spinner: {
    frames: [
      "▰▱▱▱▱▱▱",
      "▰▰▱▱▱▱▱",
      "▰▰▰▱▱▱▱",
      "▰▰▰▰▱▱▱",
      "▰▰▰▰▰▱▱",
      "▰▰▰▰▰▰▱",
      "▰▰▰▰▰▰▰",
      "▰▱▱▱▱▱▱",
    ],
    interval: 80,
  },
});

/**
 * Gets the valid list of email addresses from the validEmails.csv file,
 * and maps them to an array of EmailInt objects.
 * @returns The list of valid emails, formatted as
 * proper objects.
 */
export const getValid = async(): Promise<Array<EmailInt>> => {
  spinnies.add("read-valid", {
    color: "cyan",
    text:  "Reading valid email list...",
  });

  const filePath = join(process.cwd(), "prod", "/validEmails.csv");

  const validListString = await readFile(filePath, "utf8").catch(() => {
    return null;
  });

  if (validListString === null || validListString.length === 0) {
    spinnies.fail("read-valid", {
      color: "red",
      text:  "Failed to read valid email list. Exiting process...",
    });
    return [];
  }

  const validList: Array<EmailInt> = validListString.
    // Split by new lines
    split("\n").
    // Remove header row
    slice(1).
    // Strip accidental empty lines
    filter(Boolean).
    // Map into proper objects
    map((line) => {
      const [ email, unsubscribeId ] = line.split(",");
      if (email === undefined || unsubscribeId === undefined) {
        return { email: "", unsubscribeId: "" };
      }
      return { email, unsubscribeId };
    }).

    /**
     * Filter out the empty strings just to be safe.
     */
    filter((element) => {
      return element.email !== "" && element.unsubscribeId !== "";
    });

  spinnies.succeed("read-valid", {
    color: "green",
    text:  "Email list obtained!",
  });
  return validList;
};
