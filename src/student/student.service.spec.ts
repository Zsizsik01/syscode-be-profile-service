import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from './student.entity';

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
  });

  it('should list', async () => {
    mockRepo.find.mockResolvedValue([{ id: '1', name: 'A', email: 'a@b.c' }]);
    const res = await service.findAll();
    expect(res.length).toBe(1);
    expect(mockRepo.find).toHaveBeenCalled();
  });

  // további tesztek: create/update/remove hibás és sikeres ágak
});
