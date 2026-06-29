import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health/health.controller';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';
import { AuthProxyMiddleware } from './middleware/auth-proxy.middleware';
import { ElectoralProxyMiddleware } from './middleware/electoral-proxy.middleware';
import { PadronProxyMiddleware } from './middleware/padron-proxy.middleware';
import { CandidateProxyMiddleware } from './middleware/candidate-proxy.middleware';
import { DashboardProxyMiddleware } from './middleware/dashboard-proxy.middleware';
import { AuditProxyMiddleware } from './middleware/audit-proxy.middleware';
import { BlockchainProxyMiddleware } from './middleware/blockchain-proxy.middleware';
import { RelayerProxyMiddleware } from './middleware/relayer-proxy.middleware';
import { CryptoProxyMiddleware } from './middleware/crypto-proxy.middleware';
import { AdminProxyMiddleware } from './middleware/admin-proxy.middleware';
import { FacultyProxyMiddleware } from './middleware/faculty-proxy.middleware';
import { NotificationProxyMiddleware } from './middleware/notification-proxy.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      cache: true,
    }),
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 0,
    }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // JWT verification primero (defensa en profundidad)
    consumer.apply(JwtAuthMiddleware).forRoutes('*');
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
    consumer
      .apply(BlockchainProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(RelayerProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(CryptoProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(AdminProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(FacultyProxyMiddleware)
      .forRoutes('*');
    consumer
      .apply(NotificationProxyMiddleware)
      .forRoutes('*');
  }
}