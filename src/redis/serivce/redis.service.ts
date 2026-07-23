import { Inject, Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('Redis') private readonly redis: Redis.Redis) {}

  async set(key: string, value: string, expireTime?: number) {
    return this.redis.set(key, value, 'EX', expireTime ?? 10);
  }

  async get(key: string) {
    return await this.redis.get(key);
  }

  async del(key: string) {
    if (key.includes('*')) {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          key,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } while (cursor !== '0');
    } else {
      await this.redis.del(key);
    }
  }

  /**
   * Look-aside (Cache-Aside) 캐싱 패턴 헬퍼 메소드
   * @param key Redis 캐시 키
   * @param fetchFn Cache Miss 시 DB 등 원본 데이터 소스에서 데이터를 조회하는 비동기 함수
   * @param expireTime 캐시 만료시간 (초 단위, 기본 600초 = 10분)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    expireTime: number = 600,
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {}
    }

    const freshData = await fetchFn();
    if (freshData !== null && freshData !== undefined) {
      await this.set(key, JSON.stringify(freshData), expireTime);
    }
    return freshData;
  }
}
