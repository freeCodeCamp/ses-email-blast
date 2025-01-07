/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
// eslint-disable-next-line @typescript-eslint/naming-convention -- Pascal Case because it's a class.
import Spinnies from "spinnies";

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
 * Reads the emailBody.txt file and returns it, or an empty string on error.
 * @returns The email body text from emailBody.txt.
 */
export const getBody = async(): Promise<string> => {
  spinnies.add("read-body", {
    color: "cyan",
    text:  "Reading email body...",
  });

  const filePath = join(process.cwd(), "prod", "/emailBody.txt");

  const emailBody = await readFile(filePath, "utf8").catch(() => {
    return null;
  });

  if (emailBody === null || emailBody.length === 0) {
    spinnies.fail("read-body", {
      color: "red",
      text:  "Could not read email body. Terminating process...",
    });

    return "";
  }

  spinnies.succeed("read-body", {
    color: "green",
    text:  "Email body obtained!",
  });

  return emailBody;
};
