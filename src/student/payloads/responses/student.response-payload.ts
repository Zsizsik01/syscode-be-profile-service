import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class StudentResponsePayload {
  @IsUUID()
  id!: string;

  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @MaxLength(320)
  @IsNotEmpty()
  email!: string;
}
