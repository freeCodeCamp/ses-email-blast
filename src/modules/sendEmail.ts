import {
  SESv2Client,
  SESv2ClientConfig,
  SendEmailCommand,
  SendEmailRequest
} from "@aws-sdk/client-sesv2";

import { ConfigInt } from "../interfaces/configInt";
import { EmailInt } from "../interfaces/emailInt";
import { sendReportInt } from "../interfaces/sendReportInt";

/**
 * Sends an email with the passed configuration and body to the passed email address.
 * Replaces the {{unsubscribeId}} body string with the email's actual unsubscribeId.
 *
 * @param {ConfigInt} config The configuration object from getEnv.
 * @param {EmailInt} email The email and unsubscribeId to send to.
 * @param {string} body The email body text from emailBody.txt.
 * @returns {Promise<sendReportInt>} Returns sendReportInt.
 */
export const sendEmail = async (
  config: ConfigInt,
  email: EmailInt,
  body: string
): Promise<sendReportInt> => {
  /**
   * Break out of process if missing email or unsubscribeId.
   */
  if (!email.email || !email.unsubscribeId) {
    return {
      status: "ERROR",
      success: false,
      email: email.email || "",
      logText: `Email or Unsubscribe ID missing...`
    };
  }

  /**
   * Set the AWS API key.
   */
  const awsConfig: SESv2ClientConfig = {
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    },
    region: "us-east-1",
    apiVersion: "2010-12-01"
  };
  /**
   * Construct SendGrid message object.
   */
  const message: SendEmailRequest = {
    Destination: {
      ToAddresses: [email.email]
    },
    Content: {
      Simple: {
        Subject: {
          Data: config.subject,
          Charset: "UTF-8"
        },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: body.replace("{{unsubscribeId}}", email.unsubscribeId)
          }
        },
        Headers: [
          {
            Name: "List-Unsubscribe-Post",
            Value: "List-Unsubscribe=One-Click"
          },
          {
            Name: "List-Unsubscribe",
            Value: `<https://www.freecodecamp.org/ue/${email.unsubscribeId}>`
          }
        ]
      }
    },
    FromEmailAddress: config.fromAddress
  };

  const client = new SESv2Client(awsConfig);
  const command = new SendEmailCommand(message);

  try {
    const success = await client.send(command);
    if (success.$metadata.httpStatusCode !== 200) {
      return {
        status: "FAILED",
        success: false,
        email: email.email,
        logText: `API reported error ${success.$metadata.httpStatusCode}.`
      };
    }
    return {
      status: "PASSED",
      success: true,
      email: email.email,
      logText: `Email successfully sent!`
    };
  } catch (error) {
    return {
      status: "ERROR",
      success: false,
      email: email.email || "",
      logText: `API reported error ${error}`
    };
  }
};
