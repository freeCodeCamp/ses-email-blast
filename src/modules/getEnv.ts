import chalk from "chalk";
import inquirer from "inquirer";
import Spinnies from "spinnies";

import { ConfigInt } from "../interfaces/configInt";

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
 * Verifies the four environment variables needed for the send script.
 * Confirms correct email and subject line with user.
 *
 * @returns {ConfigInt} Returns the configuration object. The valid property is true
 * on success, false on missing/invalid values.
 */
export const getEnv = async (): Promise<ConfigInt> => {
  const results: ConfigInt = {
    accessKeyId: "",
    secretAccessKey: "",
    fromAddress: "",
    subject: "",
    valid: false
  };
  /**
   * Start a spinner for this process.
   */
  spinnies.add("env-check", {
    color: "cyan",
    text: "Validating .env"
  });

  /**
   * Checks that all required environment variables are present!
   */
  if (!process.env.AWS_KEY) {
    spinnies.fail("env-check", {
      color: "red",
      text: "Missing AWS API key!"
    });
    process.exit(1);
  }
  results.accessKeyId = process.env.AWS_KEY;

  if (!process.env.AWS_SECRET) {
    spinnies.fail("env-check", {
      color: "red",
      text: "Missing AWS API secret!"
    });
    process.exit(1);
  }
  results.secretAccessKey = process.env.AWS_SECRET;

  const fromAddress = process.env.FROM_ADDRESS;
  if (!fromAddress) {
    spinnies.fail("env-check", {
      color: "red",
      text: "Missing sender email address!"
    });
    process.exit(1);
  }
  results.fromAddress = fromAddress;

  results.subject = process.env.MAIL_SUBJECT || "Weekly Update";

  spinnies.succeed("env-check", {
    color: "green",
    text: "Environment variables validated!"
  });
  /**
   * Prompts the user for manual confirmation of email and subject fields.
   */
  const validateEnv = await inquirer.prompt([
    {
      type: "confirm",
      message: chalk.cyan(
        `Is ${chalk.yellow(fromAddress)} the correct email address?`
      ),
      name: "email_valid"
    },
    {
      type: "confirm",
      message: chalk.cyan(
        `Is ${chalk.yellow(results.subject)} the correct subject line?`
      ),
      name: "subject_valid"
    }
  ]);

  if (!validateEnv.email_valid) {
    console.info(chalk.red("Email is incorrect. Exiting process..."));
    return results;
  }

  if (!validateEnv.subject_valid) {
    console.info(chalk.red("Subject is incorrect. Exiting process..."));
    return results;
  }

  results.valid = true;
  return results;
};
