import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health/health.controller';
import { AuthProxyMiddleware } from './middleware/auth-proxy.middleware';
import { ElectoralProxyMiddleware } from './middleware/electoral-proxy.middleware';
import { PadronProxyMiddleware } from './middleware/padron-proxy.middleware';
import { CandidateProxyMiddleware } from './middleware/candidate-proxy.middleware';
import { DashboardProxyMiddleware } from './middleware/dashboard-proxy.middleware';
import { AuditProxyMiddleware } from './middleware/audit-proxy.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      cache: true,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 0,
    }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(ElectoralProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(PadronProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(CandidateProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(DashboardProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(AuditProxyMiddleware)
      .forRoutes('*');
  }
}