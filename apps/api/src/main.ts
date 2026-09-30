import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = new Set([
    'http://localhost:3000',
    ...(process.env.WEB_HOST ? [`https://${process.env.WEB_HOST}`] : []),
    ...(process.env.WEB_ORIGIN || '').split(',').map(value => value.trim()).filter(Boolean),
  ]);
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) =>
      callback(null, !origin || allowedOrigins.has(origin)),
    credentials: true,
  });
  const port = Number(process.env.PORT || process.env.API_PORT || 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
