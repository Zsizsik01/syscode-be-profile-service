import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student/entities';
import { StudentController } from './student/controllers';
import { StudentService } from './student/services';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'profiledb',
      entities: [Student],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Student]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class AppModule {}
