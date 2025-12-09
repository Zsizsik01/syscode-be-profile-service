import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateStudentRequestPayload {
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
