import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { GroqService } from '../groq/groq.service';
import { VotingService } from '../voting/voting.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;

  constructor(
    private configService: ConfigService,
    private groqService: GroqService,
    private votingService: VotingService,
  ) {}

  onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not defined. Telegram bot will not start.');
      return;
    }

    this.bot = new Telegraf(token);

    this.bot.command('start', (ctx) => {
      this.scheduleDeletion(ctx, ctx.message.message_id, 0); // Delete command immediately
      ctx.reply('Welcome to the Anonymous Voting Bot! Ask me questions or use /vote <id> <pass> <candidate_id> to cast your vote. All messages self-destruct in 5 seconds.')
        .then((msg) => this.scheduleDeletion(ctx, msg.message_id, 5000));
    });

    this.bot.command('vote', async (ctx) => {
      // Immediate deletion of the user's command containing sensitive info
      this.scheduleDeletion(ctx, ctx.message.message_id, 0);

      const parts = ctx.message.text.split(' ');
      if (parts.length < 4) {
        const msg = await ctx.reply('Usage: /vote <identifier> <password> <candidate_id>');
        this.scheduleDeletion(ctx, msg.message_id, 5000);
        return;
      }

      const [, identificador, password, candidateId] = parts;

      try {
        const statusMsg = await ctx.reply('Processing your vote anonymously...');
        this.scheduleDeletion(ctx, statusMsg.message_id, 5000);

        const result = await this.votingService.castVote(identificador, password, candidateId);
        
        const successMsg = await ctx.reply(result);
        this.scheduleDeletion(ctx, successMsg.message_id, 5000);
      } catch (error: any) {
        const errorMsg = await ctx.reply(`Voting failed: ${error.message}`);
        this.scheduleDeletion(ctx, errorMsg.message_id, 5000);
      }
    });

    this.bot.on('text', async (ctx) => {
      // Normal questions: delete user message after 5s
      this.scheduleDeletion(ctx, ctx.message.message_id, 5000);
      
      const userMessage = ctx.message.text;
      try {
        const response = await this.groqService.generateResponse(userMessage);
        const replyMsg = await ctx.reply(response);
        this.scheduleDeletion(ctx, replyMsg.message_id, 5000);
      } catch (error) {
        this.logger.error('Error generating Groq response', error);
      }
    });

    this.bot.launch();
    this.logger.log('Telegram bot started.');
  }

  private scheduleDeletion(ctx: any, messageId: number, delayMs: number) {
    setTimeout(() => {
      ctx.deleteMessage(messageId).catch((err: any) => {
        this.logger.error(`Failed to delete message ${messageId}`, err);
      });
    }, delayMs);
  }
}
