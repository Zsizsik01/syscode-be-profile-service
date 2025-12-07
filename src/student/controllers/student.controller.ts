import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateStudentRequestPayload,
  UpdateStudentRequestPayload,
} from '../payloads/requests';
import { StudentResponsePayload } from '../payloads/responses';
import { StudentService } from '../services';

@Controller('students')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class StudentController {
  constructor(private readonly service: StudentService) {}

  @Get()
  public async list(): Promise<StudentResponsePayload[]> {
    return await this.service.findAll();
  }

  @Post()
  public async create(
    @Body() payload: CreateStudentRequestPayload,
  ): Promise<StudentResponsePayload> {
    return await this.service.create(payload);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() payload: UpdateStudentRequestPayload,
  ): Promise<StudentResponsePayload> {
    return await this.service.update(id, payload);
  }

  @Delete(':id')
  public async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }
}
