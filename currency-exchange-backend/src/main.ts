import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CalculateExchangeRequestDto } from './transaction/dto/calculate-exchange.dto';
import {
  BadRequestErrorResponseDto,
  InternalServerErrorResponseDto,
} from './common/dto/error-response.dto';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const NODE_ENV = configService.getOrThrow<string>('NODE_ENV');
  const APP_PORT = configService.get<number>('PORT', 8000);

  if (NODE_ENV === 'local') {
    const config = new DocumentBuilder()
      .setTitle('Exchange API')
      .setDescription('API for currency exchange rates')
      .setVersion('0.1')
      .addTag('exchange')
      .build();

    const documentFactory = () =>
      SwaggerModule.createDocument(app, config, {
        extraModels: [
          InternalServerErrorResponseDto,
          BadRequestErrorResponseDto,
          CalculateExchangeRequestDto,
        ],
      });
    SwaggerModule.setup('api', app, documentFactory);
  }

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      enableDebugMessages: false,
      exceptionFactory: (errors: ValidationError[]) => {
        const firstError = errors[0];
        const constraints = firstError.constraints || {};
        const firstKey = Object.keys(constraints)[0];
        const message = constraints[firstKey];

        return new BadRequestException(message);
      },
    }),
  );

  await app.listen(APP_PORT);
}
void bootstrap();
