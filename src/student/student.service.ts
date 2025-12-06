import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateStudentDto, UpdateStudentDto } from './dto';

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

  public async create(dto: CreateStudentDto): Promise<Student> {
    const s = this.repo.create(dto);

    return this.repo.save(s);
  }

  public async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.repo.preload({ id, ...dto });

    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }

    return this.repo.save(student);
  }

  public async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException(`Student ${id} not found`);
    }
  }
}
