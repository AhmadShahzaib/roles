import { HttpStatus, Post, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  ErrorType,
  ROLES,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { RoleResponse } from '../models/roleResponse.model';

export default function AddRoleDecorators() {
  const AddRoleDecorators: Array<CombineDecoratorType> = [
    Post('add'),
    SetMetadata('permissions', [ROLES.ADD]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.CREATED, type: RoleResponse }),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorType }),
  ];
  return CombineDecorators(AddRoleDecorators);
}
