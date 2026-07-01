import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GroqModule } from './groq/groq.module';
import { TelegramModule } from './telegram/telegram.module';
import { DiscordModule } from './discord/discord.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../.env',
    }),
    GroqModule,
    TelegramModule,
    DiscordModule,
  ],
})
export class AppModule {}
