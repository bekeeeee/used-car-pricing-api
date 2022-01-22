import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieSession from 'cookie-session';

export const setupApp = (app: INestApplication) => {
  app.use(
    cookieSession({
      keys: ['asdfasfd'],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Stripped out for us any unless properies
    }),
  );
  (app as any).set('etag', false);
  app.use((req, res, next) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });
};
