/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { createWriteStream } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { MultiBar, Presets } from "cli-progress";
import dotenv from "dotenv";
import inquirer from "inquirer";
import { emailTest } from "./modules/emailTest.js";
import { getBody } from "./modules/getBody.js";
import { getEnvironment } from "./modules/getEnvironment.js";
import { getValid } from "./modules/getValid.js";
import { sendEmail } from "./modules/sendEmail.js";
import { barFormatter } from "./tools/barFormatter.js";

dotenv.config();

const isInScreenEnvironment = (): boolean => {
  const termIsCapable
    = process.env.TERM !== undefined
    && process.env.TERMCAP !== undefined;
  return (
    process.env.STY !== undefined
    || process.env.SCREEN !== undefined
    || termIsCapable
  );
};

console.info(chalk.green(`Hello! Launching email blast application.`));
if (!isInScreenEnvironment()) {
  throw new Error(
    // eslint-disable-next-line stylistic/max-len -- This is a single string.
    "You must run this script in a screen session to persist the process after closing the SSH connection.",
  );
}

/**
 * Begin by confirming the environment variables.
 */
const configuration = await getEnvironment();
if (!configuration.valid) {
  throw new Error(
    // eslint-disable-next-line stylistic/max-len -- This is a single string.
    "Environment variables are not configured correctly. Please check the .env file.",
  );
}

/**
 * Get the body of the email.
 */
const body = await getBody();

if (body.length === 0) {
  throw new Error("Email body is empty. Please check the emailBody.txt file.");
}

/**
 * Prompt for test email?
 */
const testStatus = await emailTest(configuration, body);

if (!testStatus) {
  throw new Error("Test email failed. Please check the logs.");
}

/**
 * Get the list of valid emails.
 */
const validList = await getValid();
const emailTotal = validList.length;

if (validList.length === 0) {
  throw new Error(
    "No valid emails found. Please check the validEmails.csv file.",
  );
}

const shouldProceed = await inquirer.prompt<{ continue: boolean }>([
  {
    message: chalk.cyan(
      `Proceed with sending to ${chalk.yellow(emailTotal)} addresses?`,
    ),
    name: "continue",
    type: "confirm",
  },
]);

if (!shouldProceed.continue) {
  console.error(chalk.red("Process cancelled. Have a nice day."));
  process.exit(0);
}

console.info(chalk.green("Beginning send process..."));

/**
 * Begin a write stream to create a CSV for failed emails.
 */
const failedPath = join(process.cwd(), "prod", "failedEmails.csv");
const failureStream = createWriteStream(failedPath);
failureStream.write("email,unsubscribeId\n");

/**
 * Begin a write stream to log all API calls.
 */
const logPath = join(process.cwd(), "prod", "/emailLog.txt");
const logStream = createWriteStream(logPath);
logStream.write("Status - Email - Message\n");

/**
 * Run the send function on each email.
 */
console.info(chalk.magenta.underline("Email Send Progress:"));

const progress = new MultiBar(
  { clearOnComplete: false, format: barFormatter, hideCursor: true },
  Presets.shades_classic,
);

const totalBar = progress.create(emailTotal, 0, { task: "Processed" });
const sentBar = progress.create(emailTotal, 0, { task: "Sent" });
const failedBar = progress.create(emailTotal, 0, { task: "Failed" });

for (let index = 0; index < emailTotal; index = index + 1) {
  totalBar.increment();
  const targetEmail = validList[index];

  /**
   * This should never be possible, as the loop is bounded to the length of the validList array.
   * However, we add this condition to please TypeScript.
   */
  if (!targetEmail) {
    continue;
  }
  // eslint-disable-next-line no-await-in-loop -- I cannot run these concurrently or the API would shit itself at scale.
  const status = await sendEmail(configuration, targetEmail, body);
  if (!status.success) {
    failedBar.increment();
    failureStream.write(
      `${targetEmail.email},${targetEmail.unsubscribeId}\n`,
    );
    continue;
  }
  logStream.write(
    `${status.status} - ${status.email} - ${status.logText}\n`,
  );
  sentBar.increment();
}
progress.stop();

console.info(chalk.green("Email blast complete! Have a nice day! :)"));
