import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateStudentRequestPayload,
  UpdateStudentRequestPayload,
} from '../payloads/requests';
import { Student } from '../entities';
import { Address } from '../interfaces';
import { StudentResponsePayload } from '../payloads/responses';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);
  private readonly baseUrl = 'http://address-service:3002/address';
  private readonly authHeader =
    'Basic ' + Buffer.from('admin:password').toString('base64');

  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) {}

  public async findAll(): Promise<StudentResponsePayload[]> {
    const students = await this.repo.find();
    const result: StudentResponsePayload[] = [];

    for (const student of students) {
      try {
        const response = await fetch(`${this.baseUrl}/${student.id}`, {
          method: 'GET',
          headers: {
            Authorization: this.authHeader,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          const msg = `Failed to fetch address for student ${student.id}: ${response.status} ${response.statusText} - ${text}`;
          this.logger.error({ msg });

          throw new Error(msg);
        }

        const data: Address = await response.json();
        result.push({ ...student, address: data.address });
      } catch (error) {
        this.logger.error(
          `Error while fetching address for student ${student.id}: ${error.message}`,
        );

        throw error;
      }
    }

    return result;
  }

  public async create(
    payload: CreateStudentRequestPayload,
  ): Promise<StudentResponsePayload> {
    const student = this.repo.create(payload);
    const result = await this.repo.save(student);
    let addressResult: Address;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authHeader,
        },
        body: JSON.stringify({ id: result.id, address: payload.address }),
      });

      if (!response.ok) {
        const text = await response.text();
        const msg = `Failed to create address for student ${result.id}: ${response.status} ${response.statusText} - ${text}`;
        this.logger.error({ msg });

        throw new Error(msg);
      }

      addressResult = await response.json();

      this.logger.log(
        `Address created for student ${result.id}: ${addressResult.address}`,
      );
    } catch (error) {
      this.logger.error({
        msg: `Error while creating address for student ${result.id}: ${error.message}`,
      });

      throw error;
    }

    this.logger.log(
      `Student ${payload.name} (${payload.email}) is created successfully!`,
    );

    return { ...result, address: addressResult.address };
  }

  public async update(
    id: string,
    payload: UpdateStudentRequestPayload,
  ): Promise<StudentResponsePayload> {
    const student = await this.repo.preload({ id, ...payload });

    if (!student) {
      const msg = `Student ${id} not found!`;
      this.logger.error({ msg });

      throw new NotFoundException(msg);
    }

    const result = await this.repo.save(student);

    let addressResult: Address;

    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authHeader,
        },
        body: JSON.stringify({ address: payload.address }),
      });

      if (!response.ok) {
        const text = await response.text();
        const msg = `Failed to update address for student ${id}: ${response.status} ${response.statusText} - ${text}`;
        this.logger.error({ msg });

        throw new Error(msg);
      }

      addressResult = await response.json();

      this.logger.log(
        `Address updated for student ${id}: ${addressResult.address}`,
      );
    } catch (error) {
      this.logger.error({
        msg: `Error while updating address for student ${id}: ${error.message}`,
      });

      throw error;
    }

    this.logger.log(`Student ${id} is updated successfully!`);

    return { ...result, address: addressResult.address };
  }

  public async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);

    if (result.affected === 0) {
      const msg = `Student ${id} not found!`;
      this.logger.error({ msg });

      throw new NotFoundException(msg);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: this.authHeader },
      });

      if (!response.ok) {
        const text = await response.text();
        const msg = `Failed to remove address for student ${id}: ${response.status} ${response.statusText} - ${text}`;
        this.logger.error({ msg });

        throw new Error(msg);
      }

      this.logger.log(`Address removed for student ${id}!`);
    } catch (error) {
      this.logger.error({
        msg: `Error while removing address for student ${id}: ${error.message}`,
      });

      throw error;
    }

    this.logger.log(`Student ${id} is removed successfully!`);
  }
}
