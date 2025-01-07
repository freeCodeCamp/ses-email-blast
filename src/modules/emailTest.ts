/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import chalk from "chalk";
import inquirer from "inquirer";
// eslint-disable-next-line @typescript-eslint/naming-convention -- Pascal Case because it's a class.
import Spinnies from "spinnies";
import { sendEmail } from "./sendEmail.js";
import type { ConfigInt } from "../interfaces/configInt.js";
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
 * Prompt the user to send a test email. If agreed, sends a test
 * email through the SendGrid API to the provided address. Prompts
 * for confirmation that the email is received and is correct.
 * @param config - The configuration object from getEnv.
 * @param body - The email body text from getBody.
 * @returns True if test is skipped, true if test succeeds, false if failed.
 */
// eslint-disable-next-line max-lines-per-function -- Will refactor at some point.
export const emailTest = async(
  config: ConfigInt,
  body: string,
): Promise<boolean> => {
  const shouldTest = await inquirer.prompt<{ shouldTest: boolean }>([
    {
      message: chalk.cyan("Do you want to send a test email?"),
      name:    "shouldTest",
      type:    "confirm",
    },
  ]);

  /**
   * Return true if should NOT send. This tells the main script
   * to continue running.
   */
  if (!shouldTest.shouldTest) {
    return true;
  }

  const testAddress = await inquirer.prompt<{ testAddress: string }>([
    {
      message: chalk.cyan("Please enter your test address"),
      name:    "testAddress",
      type:    "input",
    },
  ]);

  spinnies.add("test-email", {
    color: "cyan",
    text:  "Sending test email...",
  });

  const testEmailObject: EmailInt = {
    email:         testAddress.testAddress,
    unsubscribeId: "testEmailFunction",
  };

  const success = await sendEmail(config, testEmailObject, body);

  if (success.status === "FAILED" || success.status === "ERROR") {
    spinnies.fail("test-email", {
      color: "red",
      text:  "Failed to send test email.",
    });
    return false;
  }

  spinnies.succeed("test-email", {
    color: "green",
    text:  `Email sent! Please check your ${testEmailObject.email} inbox.`,
  });

  const didRecieve = await inquirer.prompt<{ gotEmail: boolean }>([
    {
      message: chalk.cyan("Did you receive the email? Is it correct?"),
      name:    "gotEmail",
      type:    "confirm",
    },
  ]);

  if (!didRecieve.gotEmail) {
    console.error(chalk.red("Test email unsuccessful. Exiting process..."));
    return false;
  }
  console.info(chalk.green("Test email succeeded!"));
  return true;
};
