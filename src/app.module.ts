// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { AnnoncesModule } from './annonces/annonces.module';
// import { LogementsModule } from './logements/logements.module';
// import { FavorisModule } from './favoris/favoris.module';
// import { ReservationsModule } from './reservations/reservations.module';
// import { MessagesModule } from './messages/messages.module';
// import { NotificationsModule } from './notifications/notifications.module';
// import { VillesModule } from './villes/villes.module';
// import { QuartiersModule } from './quartiers/quartiers.module';
// import { PrismaModule } from './prisma/prisma.module';

// @Module({
//   imports: [AuthModule, UsersModule, AnnoncesModule, LogementsModule, FavorisModule, ReservationsModule, MessagesModule, NotificationsModule, VillesModule, QuartiersModule, PrismaModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AnnoncesModule } from './annonces/annonces.module';
import { LogementsModule } from './logements/logements.module';
import { FavorisModule } from './favoris/favoris.module';
import { ReservationsModule } from './reservations/reservations.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { VillesModule } from './villes/villes.module';
import { QuartiersModule } from './quartiers/quartiers.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
// import { UploadModule } from './upload/upload.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,

    AuthModule,
    UsersModule,
    AnnoncesModule,
    LogementsModule,
    FavorisModule,
    ReservationsModule,
    MessagesModule,
    NotificationsModule,
    VillesModule,
    QuartiersModule,
    CloudinaryModule,
    // UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}