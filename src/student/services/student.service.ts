import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateStudentRequestPayload,
  UpdateStudentRequestPayload,
} from '../payloads/requests';
import { Student } from '../entities';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) {}

  public async findAll(): Promise<Student[]> {
    return this.repo.find();
  }

  public async create(payload: CreateStudentRequestPayload): Promise<Student> {
    const student = this.repo.create(payload);
    const result = this.repo.save(student);

    this.logger.log(
      `Student ${payload.name} (${payload.email}) is created successfully!`,
    );

    return result;
  }

  public async update(
    id: string,
    payload: UpdateStudentRequestPayload,
  ): Promise<Student> {
    const student = await this.repo.preload({ id, ...payload });

    if (!student) {
      const msg = `Student ${id} not found!`;
      this.logger.error({ msg });

      throw new NotFoundException(msg);
    }

    const result = this.repo.save(student);

    this.logger.log(`Student ${id} is updated successfully!`);

    return result;
  }

  public async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);

    if (result.affected === 0) {
      const msg = `Student ${id} not found!`;
      this.logger.error({ msg });

      throw new NotFoundException(msg);
    }

    this.logger.log(`Student ${id} is removed successfully!`);
  }
}
