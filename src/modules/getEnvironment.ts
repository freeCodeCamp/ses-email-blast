/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import chalk from "chalk";
import inquirer from "inquirer";
// eslint-disable-next-line @typescript-eslint/naming-convention
import Spinnies from "spinnies";
import type { ConfigInt } from "../interfaces/configInt.js";

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
 * Verifies the four environment variables needed for the send script.
 * Confirms correct email and subject line with user.
 * @returns Returns the configuration object. The valid property is true
 * on success, false on missing/invalid values.
 */
// eslint-disable-next-line max-lines-per-function, max-statements
export const getEnvironment = async(): Promise<ConfigInt> => {
  const results: ConfigInt = {
    accessKeyId:     "",
    fromAddress:     "",
    secretAccessKey: "",
    subject:         "",
    valid:           false,
  };

  /**
   * Start a spinner for this process.
   */
  spinnies.add("env-check", {
    color: "cyan",
    text:  "Validating .env",
  });

  /**
   * Checks that all required environment variables are present!
   */
  if (process.env.AWS_KEY === undefined) {
    spinnies.fail("env-check", {
      color: "red",
      text:  "Missing AWS API key!",
    });
    process.exit(1);
  }
  results.accessKeyId = process.env.AWS_KEY;

  if (process.env.AWS_SECRET === undefined) {
    spinnies.fail("env-check", {
      color: "red",
      text:  "Missing AWS API secret!",
    });
    process.exit(1);
  }
  results.secretAccessKey = process.env.AWS_SECRET;

  const fromAddress = process.env.FROM_ADDRESS;
  if (fromAddress === undefined) {
    spinnies.fail("env-check", {
      color: "red",
      text:  "Missing sender email address!",
    });
    process.exit(1);
  }
  results.fromAddress = fromAddress;

  results.subject = process.env.MAIL_SUBJECT ?? "Weekly Update";

  spinnies.succeed("env-check", {
    color: "green",
    text:  "Environment variables validated!",
  });

  /**
   * Prompts the user for manual confirmation of email and subject fields.
   */
  const validateEnvironment = await inquirer.prompt<{
    emailValid:   boolean;
    subjectValid: boolean;
  }>([
    {
      message: chalk.cyan(
        `Is ${chalk.yellow(fromAddress)} the correct email address?`,
      ),
      name: "emailValid",
      type: "confirm",
    },
    {
      message: chalk.cyan(
        `Is ${chalk.yellow(results.subject)} the correct subject line?`,
      ),
      name: "subjectValid",
      type: "confirm",
    },
  ]);

  if (!validateEnvironment.emailValid) {
    console.info(chalk.red("Email is incorrect. Exiting process..."));
    return results;
  }

  if (!validateEnvironment.subjectValid) {
    console.info(chalk.red("Subject is incorrect. Exiting process..."));
    return results;
  }

  results.valid = true;
  return results;
};
