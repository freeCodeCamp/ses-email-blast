import AWS from "aws-sdk";
import { ConfigInt } from "../interfaces/configInt";
import { EmailInt } from "../interfaces/emailInt";
import { sendReportInt } from "../interfaces/sendReportInt";

/**
 * Sends an email with the passed configuration and body to the passed email address.
 * Replaces the {{unsubscribeId}} body string with the email's actual unsubscribeId.
 * @param {ConfigInt} config The configuration object from getEnv
 * @param {EmailInt} email The email and unsubscribeId to send to
 * @param {string} body The email body text from emailBody.txt
 * @returns {Promise<sendReportInt>} Returns sendReportInt
 */
export const sendEmail = async (
  config: ConfigInt,
  email: EmailInt,
  body: string
): Promise<sendReportInt> => {
  /**
   * Break out of process if missing email or unsubscribeId
   */
  if (!email.email || !email.unsubscribeId) {
    return {
      status: "ERROR",
      success: false,
      email: email.email || "",
      logText: `Email or Unsubscribe ID missing...`,
    };
  }

  /**
   * Set the AWS API key
   */
  const awsConfig = new AWS.Config({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    region: "us-east-1",
  });
  /**
   * Construct SendGrid message object.
   */
  const message: AWS.SES.Types.SendEmailRequest = {
    Destination: {
      ToAddresses: [email.email],
    },
    Message: {
      Subject: {
        Data: config.subject,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: body.replace("{{unsubscribeId}}", email.unsubscribeId),
        },
      },
    },
    Source: config.fromAddress,
  };

  try {
    const success = await new AWS.SES({
      ...awsConfig,
      signatureVersion: "v4",
      apiVersion: "2010-12-01",
    })
      .sendEmail(message)
      .promise();
    if (success.$response.error) {
      return {
        status: "FAILED",
        success: false,
        email: email.email,
        logText: `API reported error ${success.$response.error}.`,
      };
    }
    return {
      status: "PASSED",
      success: true,
      email: email.email,
      logText: `Email successfully sent!`,
    };
  } catch (error) {
    return {
      status: "ERROR",
      success: false,
      email: email.email || "",
      logText: `API reported error ${error}`,
    };
  }
};
