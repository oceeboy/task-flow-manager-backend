import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateAuditLogDto {
  @IsString()
  @IsNotEmpty()
  action: string; // Action performed (e.g., Create, Update, Delete)

  @IsString()
  @IsNotEmpty()
  message: string; // Message describing the action

  @IsNotEmpty()
  performedBy: Types.ObjectId; // Reference to the user who performed the action

  @IsNotEmpty()
  target: Types.ObjectId; // Reference to the entity the action was performed on

  @IsString()
  @IsNotEmpty()
  targetEntity: string; // Type of the target entity (e.g., Task, User)

  @IsOptional()
  @IsDateString()
  timestamp?: Date; // Optional; defaults to `Date.now` in the schema
}
