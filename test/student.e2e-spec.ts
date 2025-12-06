import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('StudentController (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    ds = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/students (POST) -> validation error for bad email', async () => {
    const res = await request(app.getHttpServer())
      .post('/students')
      .send({ name: 'Test', email: 'invalid-email' })
      .expect(400);
    expect(res.body.message).toBeDefined();
  });

  it('/students (POST) -> create & /students (GET) returns created', async () => {
    const payload = { name: 'Tester', email: `t${Date.now()}@example.com` };
    await request(app.getHttpServer())
      .post('/students')
      .send(payload)
      .expect(201);
    const list = await request(app.getHttpServer())
      .get('/students')
      .expect(200);
    expect(Array.isArray(list.body)).toBeTruthy();
  });
});
