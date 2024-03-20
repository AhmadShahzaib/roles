import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationService, SharedModule } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { RoleSchema } from './mongoDb/schema/Role.schema';
import { RolesController } from './app.controller';
import { RolesService } from './app.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: 'Roles', schema: RoleSchema }]),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigurationService) => ({
        uri: configService.mongoUri,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigurationService],
    }),
  ],
  controllers: [RolesController],
  providers: [RolesService, ConfigurationService, {
    provide: 'PERMISSIONS_SERVICE',
    useFactory: (config: ConfigurationService) => {
      const port: number = Number(config.get('PERMISSIONS_MICROSERVICE_PORT'));
      const host = config.get('PERMISSIONS_MICROSERVICE_HOST');

      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          port,
          host,
        },
      });
    },
    inject: [ConfigurationService],
  },
  {
    provide: 'USER_SERVICE',
    useFactory: (config: ConfigurationService) => {
      const port: number = Number(config.get('USER_MICROSERVICE_PORT'));
      const host = config.get('USER_MICROSERVICE_HOST');

      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          port,
          host,
        },
      });
    },
    inject: [ConfigurationService],
  },
  ],
})
export class AppModule {
  static port: number | string;
  static isDev: boolean;

  constructor(private readonly _configurationService: ConfigurationService) {
    AppModule.port = AppModule.normalizePort(_configurationService.port);
    AppModule.isDev = _configurationService.isDevelopment;
  }

  /**
   * Normalize port or return an error if port is not valid
   * @param val The port to normalize
   */
  private static normalizePort(val: number | string): number | string {
    const port: number = typeof val === 'string' ? parseInt(val, 10) : val;

    if (Number.isNaN(port)) {
      return val;
    }

    if (port >= 0) {
      return port;
    }

    throw new Error(`Port "${val}" is invalid.`);
  }
}
