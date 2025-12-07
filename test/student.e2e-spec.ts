import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('StudentController e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('[GET] /students', () => {
    it('should return an empty array if no students exist', async () => {
      const result = await request(app.getHttpServer())
        .get('/students')
        .expect(200);

      expect(Array.isArray(result.body)).toBeTruthy();
      expect(result.body.length).toBe(0);
    });

    it('should return a list of students', async () => {
      await request(app.getHttpServer())
        .post('/students')
        .send({ name: 'Alice', email: `alice${Date.now()}@example.com` })
        .expect(201);

      await request(app.getHttpServer())
        .post('/students')
        .send({ name: 'Bob', email: `bob${Date.now()}@example.com` })
        .expect(201);

      const result = await request(app.getHttpServer())
        .get('/students')
        .expect(200);

      expect(Array.isArray(result.body)).toBeTruthy();
      expect(result.body.length).toBeGreaterThanOrEqual(2);

      result.body.forEach((student: any) => {
        expect(student.id).toBeDefined();
        expect(student.name).toBeDefined();
        expect(student.email).toBeDefined();
        expect(typeof student.name).toBe('string');
        expect(typeof student.email).toBe('string');
      });
    });
  });

  describe('[POST] /students', () => {
    it('should throw validation error for bad email', async () => {
      const result = await request(app.getHttpServer())
        .post('/students')
        .send({ name: 'Test', email: `invalid-email` })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if name is empty', async () => {
      const result = await request(app.getHttpServer())
        .post('/students')
        .send({ name: '', email: `test@example.com` })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if email is empty', async () => {
      const result = await request(app.getHttpServer())
        .post('/students')
        .send({ name: 'Test', email: '' })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if name exceeds max length', async () => {
      const longName = 'a'.repeat(201);
      const result = await request(app.getHttpServer())
        .post('/students')
        .send({ name: longName, email: `test@example.com` })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if email exceeds max length', async () => {
      const longEmail = 'a'.repeat(321) + '@example.com';
      const result = await request(app.getHttpServer())
        .post('/students')
        .send({ name: 'Test', email: longEmail })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if name is not a string', async () => {
      const result = await request(app.getHttpServer())
        .post('/students')
        .send({ name: 12345, email: `test@example.com` })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if email is not a string', async () => {
      const result = await request(app.getHttpServer())
        .post('/students')
        .send({ name: 'Test', email: 12345 })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should create a student and return with created', async () => {
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

  describe('[PUT] /students/:id', () => {
    let studentId: string;

    beforeAll(async () => {
      const result = await request(app.getHttpServer())
        .post('/students')
        .send({ name: 'Initial', email: `initial${Date.now()}@example.com` })
        .expect(201);

      studentId = result.body.id;
    });

    it('should update a student successfully', async () => {
      const payload = { name: 'Updated Name' };
      const result = await request(app.getHttpServer())
        .put(`/students/${studentId}`)
        .send(payload)
        .expect(200);

      expect(result.body.name).toBe(payload.name);
    });

    it('should throw NotFoundException for non-existing student', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await request(app.getHttpServer())
        .put(`/students/${fakeId}`)
        .send({ name: 'Someone' })
        .expect(404);

      expect(result.body.message).toContain('not found');
    });

    it('should throw validation error for bad email', async () => {
      const result = await request(app.getHttpServer())
        .put(`/students/${studentId}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if name exceeds max length', async () => {
      const longName = 'a'.repeat(201);
      const result = await request(app.getHttpServer())
        .put(`/students/${studentId}`)
        .send({ name: longName })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if email exceeds max length', async () => {
      const longEmail = 'a'.repeat(321) + '@example.com';
      const result = await request(app.getHttpServer())
        .put(`/students/${studentId}`)
        .send({ email: longEmail })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if name is not a string', async () => {
      const result = await request(app.getHttpServer())
        .put(`/students/${studentId}`)
        .send({ name: 12345 })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should throw validation error if email is not a string', async () => {
      const result = await request(app.getHttpServer())
        .put(`/students/${studentId}`)
        .send({ email: 12345 })
        .expect(400);

      expect(result.body.message).toBeDefined();
    });

    it('should allow partial updates', async () => {
      const payload = { email: `updated${Date.now()}@example.com` };
      const result = await request(app.getHttpServer())
        .put(`/students/${studentId}`)
        .send(payload)
        .expect(200);

      expect(result.body.email).toBe(payload.email);
      expect(result.body.name).toBeDefined();
    });
  });

  describe('[DELETE] /students/:id', () => {
    let studentId: string;

    beforeAll(async () => {
      const result = await request(app.getHttpServer())
        .post('/students')
        .send({ name: 'ToDelete', email: `delete${Date.now()}@example.com` })
        .expect(201);

      studentId = result.body.id;
    });

    it('should delete a student successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/students/${studentId}`)
        .expect(200);

      const list = await request(app.getHttpServer())
        .get('/students')
        .expect(200);

      const exists = list.body.some((student: any) => student.id === studentId);
      expect(exists).toBe(false);
    });

    it('should throw NotFoundException for non-existing student', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await request(app.getHttpServer())
        .delete(`/students/${fakeId}`)
        .expect(404);

      expect(result.body.message).toContain('not found');
    });
  });
});
