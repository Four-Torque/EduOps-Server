import { APP_NAME } from 'src/global';

const PREFIX = APP_NAME;

export const RedisKey = {
  verificationRegister: (token: string) =>
    `${PREFIX}:verification:register:${token}`,
  verificationReset: (token: string) => `${PREFIX}:verification:reset:${token}`,
  userRefreshToken: (userId: string) => `${PREFIX}:RT:${userId}`,
  cachedTokens: (token: string) => `${PREFIX}:cached:${token}`,
  userProfile: (userId: string) => `${PREFIX}:user:profile:${userId}`,
  userEntity: (userId: string) => `${PREFIX}:user:entity:${userId}`,
  categoryList: () => `${PREFIX}:category:all`,
  categoryDetail: (id: string) => `${PREFIX}:category:${id}`,
  academyInfo: () => `${PREFIX}:academy:info`,
  classDetail: (id: string) => `${PREFIX}:class:${id}`,
  // Subject Cache Keys
  subjectList: (search?: string) =>
    `${PREFIX}:subject:all:${search || 'default'}`,
  // Student Cache Keys
  studentDetail: (id: string) => `${PREFIX}:student:${id}`,
  studentStats: () => `${PREFIX}:student:stats`,
  // Vendor Cache Keys
  vendorDetail: (id: string) => `${PREFIX}:vendor:${id}`,
};
