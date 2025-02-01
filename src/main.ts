import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app/app.module'
import fastifyCompress from '@fastify/compress'
import fastifyCors from '@fastify/cors'
// Inside bootstrap()

async function bootstrap() {
 const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }))
 await app.register(fastifyCompress, { global: true })
 await app.register(fastifyCors, { origin: '*' })
 await app.listen(3000, '0.0.0.0')
}

bootstrap()
