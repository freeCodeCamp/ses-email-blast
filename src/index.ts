import { createWriteStream } from "fs";
import { join } from "path";

import chalk from "chalk";
import { MultiBar, Presets } from "cli-progress";
import dotenv from "dotenv";
import inquirer from "inquirer";

import { emailTest } from "./modules/emailTest.js";
import { getBody } from "./modules/getBody.js";
import { getEnv } from "./modules/getEnv.js";
import { getValid } from "./modules/getValid.js";
import { sendEmail } from "./modules/sendEmail.js";
import { barFormatter } from "./tools/barFormatter.js";

dotenv.config();

const isInScreenEnvironment = () => {
  return (
    process.env.STY !== undefined ||
    process.env.SCREEN !== undefined ||
    (process.env.TERM !== undefined && process.env.TERMCAP)
  );
};

// Anonymous function for IIFE to allow async
(async function () {
  console.info(chalk.green(`Hello! Launching email blast application.`));
  if (!isInScreenEnvironment()) {
    throw new Error(
      "You must run this script in a screen session to persist the process after closing the SSH connection."
    );
  }
  /**
   * Begin by confirming the environment variables.
   */
  const configuration = await getEnv();
  if (!configuration.valid) {
    return;
  }

  /**
   * Get the body of the email.
   */
  const body = await getBody();

  if (!body || !body.length) {
    return;
  }

  /**
   * Prompt for test email?
   */
  const testStatus = await emailTest(configuration, body);

  if (!testStatus) {
    return;
  }

  /**
   * Get the list of valid emails.
   */
  const validList = await getValid();
  const emailTotal = validList.length;

  if (!validList.length) {
    return;
  }

  const shouldProceed = await inquirer.prompt([
    {
      name: "continue",
      message: chalk.cyan(
        `Proceed with sending to ${chalk.yellow(emailTotal)} addresses?`
      ),
      type: "confirm"
    }
  ]);

  if (!shouldProceed.continue) {
    console.error(chalk.red("Process cancelled. Have a nice day."));
    return;
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
    { clearOnComplete: false, hideCursor: true, format: barFormatter },
    Presets.shades_classic
  );

  const totalBar = progress.create(emailTotal, 0, { task: "Processed" });
  const sentBar = progress.create(emailTotal, 0, { task: "Sent" });
  const failedBar = progress.create(emailTotal, 0, { task: "Failed" });

  for (let i = 0; i < emailTotal; i++) {
    totalBar.increment();
    const targetEmail = validList[i];
    /**
     * This should never be possible, as the loop is bounded to the length of the validList array.
     * However, we add this condition to please TypeScript.
     */
    if (!targetEmail) {
      continue;
    }
    const status = await sendEmail(configuration, targetEmail, body);
    if (!status.success) {
      failedBar.increment();
      failureStream.write(
        `${targetEmail.email},${targetEmail.unsubscribeId}\n`
      );
      logStream.write(
        `${status.status} - ${status.email} - ${status.logText}\n`
      );
    } else {
      logStream.write(
        `${status.status} - ${status.email} - ${status.logText}\n`
      );
      sentBar.increment();
    }
  }

  progress.stop();

  console.info(chalk.green("Email blast complete! Have a nice day! :)"));
})();
