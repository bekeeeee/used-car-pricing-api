import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
const cookieSession = require('cookie-session');
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(
  //   cookieSession({
  //     keys: ['asdfasfd'],
  //   }),
  // );
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // Stripped out for us any unless properies
  //   }),
  // );
  (app as any).set('etag', false);
  app.use((req, res, next) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });
  await app.listen(3000);
}
bootstrap();
