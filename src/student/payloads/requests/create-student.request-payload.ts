import { IsString, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateStudentRequestPayload {
  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @MaxLength(320)
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MaxLength(320)
  @IsNotEmpty()
  address!: string;
}
