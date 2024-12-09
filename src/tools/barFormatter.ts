/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import chalk from "chalk";
import type { Options, Params } from "cli-progress";

/**
 * Generates progress bars for the terminal.
 * @param options - The progress bar option object.
 * @param parameters - The progress bar parameters object.
 * @param payload - The progress bar payload object.
 * @returns The formatted progress bar.
 */
// eslint-disable-next-line complexity, max-lines-per-function
export const barFormatter = (
  options: Options,
  parameters: Params,
  payload: Record<string, string>,
): string => {
  const bar = (options.barCompleteString ?? "=").slice(
    0,
    Math.max(0, Math.round(parameters.progress * (options.barsize ?? 40))),
  );
  const barIncomplete = options.barIncompleteString?.slice(
    0,
    Math.max(0, options.barIncompleteString.length - bar.length),
  ).toString() ?? "";
  const percentage = (Math.floor(parameters.progress * 10_000) / 100).
    toString();

  const value = parameters.value.toString();
  const total = parameters.total.toString();
  const etaTime = parameters.eta;
  const etaMinutesRemaining = etaTime % 3600;
  const etaHours = etaTime >= 3600
    ? etaTime / 3600
    : 0;
  const etaMinutes = etaTime >= 60
    ? etaMinutesRemaining / 60
    : 0;
  const etaSeconds = (etaTime - etaHours - etaMinutes) % 60;
  switch (payload.task) {
    case "Processed":
      return chalk.cyan(
        `Processed: [${bar}${barIncomplete}] | ${percentage}% complete! | ETA: ${Math.trunc(etaHours).toString()}h ${Math.trunc(etaMinutes).toString()}m ${Math.trunc(etaSeconds).toString()}s | ${
          value
        }/${total}`,
      );
    case "Sent":
      return chalk.green(
        `     Sent: [${bar}${barIncomplete}] | ${percentage}% of processed emails | ${value}`,
      );
    case "Failed":
      return chalk.red(
        `   Failed: [${bar}${barIncomplete}] | ${percentage}% of processed emails | ${value}`,
      );
    case "Skipped":
      return chalk.yellow(
        `  Skipped: [${bar}${barIncomplete}] | ${percentage}% of processed emails | ${value}`,
      );
    case undefined:
      return chalk.white(
        `  Unknown: [${bar}${barIncomplete}] | ${percentage}% of processed emails | ${value}`,
      );
    default:
      return chalk.white(
        `  Unknown: [${bar}${barIncomplete}] | ${percentage}% of processed emails | ${value}`,
      );
  }
};
