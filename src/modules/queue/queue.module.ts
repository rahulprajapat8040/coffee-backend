import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
  imports: [
    BullModule.forRoot({ connection: { url: process.env.REDIS_URL! } }),
  ],
})
export class QueueModule {}