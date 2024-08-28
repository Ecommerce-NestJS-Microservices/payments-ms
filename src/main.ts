import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

  const logger = new Logger('Payments-ms')



  const app = await NestFactory.create(AppModule, {
    rawBody: true // this send the body as a buffer, which is required by stripe 
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      }
    },
    { inheritAppConfig: true },

  )


  //this is hybrid  
  await app.startAllMicroservices(); //microservicio

  await app.listen(envs.port); // api res

  console.log('Health check configured !')

  logger.log(`Payments Microservice running on port ${envs.port}`)


}
bootstrap();
