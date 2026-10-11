import { Global, Module } from "@nestjs/common";
import { redisProvider } from "./redis.provider.js";
import { RedisService } from "./redis.service.js";

@Global()
@Module({
  providers: [redisProvider, RedisService],
  exports: [RedisService],
})
export class RedisModule {}