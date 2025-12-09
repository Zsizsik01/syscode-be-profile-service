import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { NotFoundException } from '@nestjs/common';

global.fetch = jest.fn();

const mockFetch = (data: any, ok = true) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
};

describe('StudentService', () => {
  let service: StudentService;
  let repo: Repository<Student>;

  const mockRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: getRepositoryToken(Student), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    repo = module.get<Repository<Student>>(getRepositoryToken(Student));

    jest.clearAllMocks();
  });

  it('should list all students', async () => {
    mockRepo.find.mockResolvedValue([{ id: '1', name: 'A', email: 'a@b.c' }]);

    mockFetch({ address: 'test-address' });

    const result = await service.findAll();

    expect(result[0].address).toBe('test-address');
    expect(mockRepo.find).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should create a student', async () => {
    const payload = { name: 'A', email: 'a@b.c', address: 'test-address' };
    const createdStudent = { id: '1', ...payload };

    mockRepo.create.mockReturnValue(createdStudent);
    mockRepo.save.mockResolvedValue(createdStudent);

    mockFetch({ address: payload.address });

    const result = await service.create(payload);

    expect(result.address).toBe(payload.address);
    expect(mockRepo.create).toHaveBeenCalledWith(payload);
    expect(mockRepo.save).toHaveBeenCalledWith(createdStudent);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should update an existing student', async () => {
    const payload = {
      name: 'Updated',
      email: 'new-email@email.com',
      address: 'new-address',
    };
    const student = { id: '1', name: 'A', email: 'a@b.c' };
    const updatedStudent = { ...student, ...payload };

    mockRepo.preload.mockResolvedValue(updatedStudent);
    mockRepo.save.mockResolvedValue(updatedStudent);

    mockFetch({ address: payload.address });

    const result = await service.update('1', payload);

    expect(result.address).toBe(payload.address);
    expect(mockRepo.preload).toHaveBeenCalledWith({ id: '1', ...payload });
    expect(mockRepo.save).toHaveBeenCalledWith(updatedStudent);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should throw NotFoundException if student to update is not found', async () => {
    mockRepo.preload.mockResolvedValue(undefined);

    await expect(
      service.update('1', {
        name: 'X',
        email: 'a@b.c',
        address: 'new-address',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should remove an existing student', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 1 });

    mockFetch({}, true);

    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should throw NotFoundException if student to remove is not found', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
