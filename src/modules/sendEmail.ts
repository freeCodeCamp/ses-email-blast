/* eslint-disable @typescript-eslint/naming-convention -- That one object is an underscore mess thanks to AWS. */
/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import {
  SESClient,
  type SESClientConfig,
  SendEmailCommand,
  type SendEmailRequest,
} from "@aws-sdk/client-ses";
import type { ConfigInt } from "../interfaces/configInt.js";
import type { EmailInt } from "../interfaces/emailInt.js";
import type { SendReportInt } from "../interfaces/sendReportInt.js";

/**
 * Sends an email with the passed configuration and body to the passed email address.
 * Replaces the {{unsubscribeId}} body string with the email's actual unsubscribeId.
 * @param config - The configuration object from getEnv.
 * @param email - The email and unsubscribeId to send to.
 * @param body - The email body text from emailBody.txt.
 * @returns Returns SendReportInt.
 */
// eslint-disable-next-line max-lines-per-function -- Will refactor at some point.
export const sendEmail = async(
  config: ConfigInt,
  email: EmailInt,
  body: string,
): Promise<SendReportInt> => {
  if (email.email === "" || email.unsubscribeId === "") {
    return {
      email:   email.email,
      logText: `Email or Unsubscribe ID missing...`,
      status:  "ERROR",
      success: false,
    };
  }

  /**
   * Set the AWS API key.
   */
  const awsConfig: SESClientConfig = {
    apiVersion:  "2010-12-01",
    credentials: {
      accessKeyId:     config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    region: "us-east-2",
  };

  /**
   * Construct SendGrid message object.
   */
  const message: SendEmailRequest = {
    Destination: {
      ToAddresses: [ email.email ],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data:    body.replace("{{unsubscribeId}}", email.unsubscribeId),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data:    config.subject,
      },
    },
    Source: config.fromAddress,
  };

  const client = new SESClient(awsConfig);
  const command = new SendEmailCommand(message);

  try {
    const success = await client.send(command);
    if (success.$metadata.httpStatusCode !== 200) {
      return {
        email:   email.email,
        logText: `API reported error ${success.$metadata.httpStatusCode?.toString() ?? "XXX"}.`,
        status:  "FAILED",
        success: false,
      };
    }
    return {
      email:   email.email,
      logText: `Email successfully sent!`,
      status:  "PASSED",
      success: true,
    };
  } catch (error) {
    return {
      email:   email.email,
      logText: `API reported error ${JSON.stringify(error, null, 2)}`,
      status:  "ERROR",
      success: false,
    };
  }
};
