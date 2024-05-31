import { Schema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import RoleDocument from 'mongoDb/document/Role.document';
import { BaseResponseType } from '@shafiqrathore/logeld-tenantbackend-common-future';
// import iPermission from 'permissions/interfaces/iPermissions';

export class RoleResponse extends BaseResponseType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  roleName?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  tenantId?: string;

  @ApiProperty()
  permissions: [any] | [string] | any[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;

  constructor(role: RoleDocument | RoleResponse) {
    super();
    this.id = role.id;
    this.roleName = role.roleName;
    this.description = role.description;
    this.tenantId = role.tenantId;
    this.permissions = role.permissions;
    this.isActive = role.isActive;
    this.createdAt = role.createdAt;
  }
}
