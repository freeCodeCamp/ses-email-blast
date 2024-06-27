import { readFile } from "fs/promises";
import { join } from "path";

import Spinnies from "spinnies";

import { EmailInt } from "../interfaces/emailInt.js";

const spinnies = new Spinnies({
  spinner: {
    interval: 80,
    frames: [
      "▰▱▱▱▱▱▱",
      "▰▰▱▱▱▱▱",
      "▰▰▰▱▱▱▱",
      "▰▰▰▰▱▱▱",
      "▰▰▰▰▰▱▱",
      "▰▰▰▰▰▰▱",
      "▰▰▰▰▰▰▰",
      "▰▱▱▱▱▱▱"
    ]
  }
});

/**
 * Gets the valid list of email addresses from the validEmails.csv file,
 * and maps them to an array of EmailInt objects.
 *
 * @returns {Promise<EmailInt[]>} The list of valid emails, formatted as
 * proper objects.
 */
export const getValid = async (): Promise<EmailInt[]> => {
  spinnies.add("read-valid", {
    color: "cyan",
    text: "Reading valid email list..."
  });

  const filePath = join(process.cwd(), "prod", "/validEmails.csv");

  const validListString = await readFile(filePath, "utf8").catch(() => null);

  if (!validListString || !validListString.length) {
    spinnies.fail("read-valid", {
      color: "red",
      text: "Failed to read valid email list. Exiting process..."
    });
    return [];
  }

  const validList: EmailInt[] = validListString
    // Split by new lines
    .split("\n")
    // Remove header row
    .slice(1)
    // Strip accidental empty lines
    .filter((line) => line)
    // Map into proper objects
    .map((line) => {
      const [email, unsubscribeId] = line.split(",");
      if (!email || !unsubscribeId) {
        /**
         * Just in case, we return empty strings when the split doesn't generate
         * the expected data.
         */
        return { email: "", unsubscribeId: "" };
      }
      return { email, unsubscribeId };
    })
    /**
     * Filter out the empty strings just to be safe.
     */
    .filter((el) => el.email && el.unsubscribeId);

  spinnies.succeed("read-valid", {
    color: "green",
    text: "Email list obtained!"
  });
  return validList;
};
