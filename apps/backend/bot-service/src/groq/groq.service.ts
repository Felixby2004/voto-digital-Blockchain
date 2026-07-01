import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private groq: Groq;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is not defined. The bot will not be able to answer questions.');
    }
    this.groq = new Groq({ apiKey });
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an anonymous voting assistant for a university election system. 
You must strictly answer ALL questions in English only, regardless of the language the user uses.
Your purpose is to help users understand the voting process, provide general information, and assist them. 
Maintain strict anonymity: remind users that their interactions here self-destruct to protect their identity.
Keep your answers brief and concise. Do not use markdown if the platform doesn't support it well.`,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        model: 'llama-3.3-70b-versatile',
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
    } catch (error) {
      this.logger.error('Error calling Groq API', error);
      return 'Sorry, I am currently unavailable. Please try again later.';
    }
  }
}
