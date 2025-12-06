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
import { StudentService } from './student.service';
import { CreateStudentDto, UpdateStudentDto } from './dto';

@Controller('students')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class StudentController {
  constructor(private readonly svc: StudentService) {}

  @Get()
  public async list() {
    return await this.svc.findAll();
  }

  @Post()
  public async create(@Body() dto: CreateStudentDto) {
    return await this.svc.create(dto);
  }

  @Put(':id')
  public async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return await this.svc.update(id, dto);
  }

  @Delete(':id')
  public async delete(@Param('id') id: string) {
    return await this.svc.remove(id);
  }
}
