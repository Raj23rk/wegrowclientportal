import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { PortalModule } from './portal/portal.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://127.0.0.1:27017/wegrow_portal',
        // In case local MongoDB is offline or bootstrapping, retry softly
        serverSelectionTimeoutMS: 5000
      }),
      inject: [ConfigService]
    }),
    SupabaseModule,
    AuthModule,
    ClientsModule,
    PortalModule,
    AdminModule
  ]
})
export class AppModule {}
