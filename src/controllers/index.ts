import index from './idx.ctr.ts';
import authController from './auth.ctr.ts';
import registrationController from './reg.ctr.ts';
import accountController from './acc.ctr.ts';
import resetController from './rst.ctr.ts';
import demoController from './demo.ctr.ts';

const controllers = {
  idx: index,
  auth: authController,
  reg: registrationController,
  acc: accountController,
  res: resetController,
  demo: demoController,
};

export default controllers;
