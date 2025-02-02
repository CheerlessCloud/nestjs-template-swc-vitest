import { config } from 'dotenv-flow';

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  config();
}
