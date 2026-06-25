import { APP_NAME } from 'src/global';

const PREFIX = APP_NAME;

export const RedisKey = {
  verificationRegister: (token: string) =>
    `${PREFIX}:verification:register:${token}`,
  verificationReset: (token: string) => `${PREFIX}:verification:reset:${token}`,
};
