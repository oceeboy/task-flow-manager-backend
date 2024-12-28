import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateAuditLogDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  performedBy?: Types.ObjectId;

  @IsOptional()
  target?: Types.ObjectId;

  @IsOptional()
  @IsString()
  targetEntity?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: Date;
}
