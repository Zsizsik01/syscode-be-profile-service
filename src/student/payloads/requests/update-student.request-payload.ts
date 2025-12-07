import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentRequestPayload } from './create-student.request-payload';

export class UpdateStudentRequestPayload extends PartialType(
  CreateStudentRequestPayload,
) {}
