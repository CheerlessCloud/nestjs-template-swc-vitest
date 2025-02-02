import './libs/dotenv-loader.ts';
import { AppConfigurator } from './app/app.configurator.ts';

async function bootstrap() {
  const configurator = new AppConfigurator();
  await configurator.initApp();
  await configurator.startAsPersistentInstance();
}

bootstrap();
