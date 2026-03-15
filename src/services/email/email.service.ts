import { getTemplate, mailTemplate } from './email.const.ts';
import resend from './transporter.ts';

const FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });

  if (error) {
    throw new Error(error.message);
  }
}

async function sendTemplateMail(
  email: string,
  token: string,
  type: (typeof mailTemplate)[keyof typeof mailTemplate],
): Promise<boolean> {
  const data = getTemplate[type](token);

  try {
    await sendMail(email, data.subject, data.html);

    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return false;
  }
}

const emailService = {
  send: sendMail,
  sendTemplate: sendTemplateMail,
};

export default emailService;
