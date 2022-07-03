import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Jewel, JewelSchema } from './JewelModel';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/TIMELESS_COLLECTION'),
    MongooseModule.forFeature([{ name: Jewel.name, schema: JewelSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
