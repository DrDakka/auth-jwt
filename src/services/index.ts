import userService from './user.service.ts';
import tokenService from './token.service.ts';
import emailService from './email/email.service.ts';

const services = {
  user: userService,
  token: tokenService,
  email: emailService,
};

export default services;
