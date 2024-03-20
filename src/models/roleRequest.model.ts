import { Schema } from 'mongoose';
import { IsNotEmpty, IsArray, IsMongoId, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RoleRequest {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  roleName: string;

  @ApiProperty({ example: 'Some description of the role.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  tenantId?: string;

  @ApiProperty({
    example: ['1231241341', '12313231'],
    description:
      'The array of IDs of the permissions to be attached with the role',
  })
  @IsArray()
  @IsMongoId({ each: true })
  permissions: [string] | string[];

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
