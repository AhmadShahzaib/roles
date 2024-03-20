import { HttpStatus, Put, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  ROLES,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { RoleResponse } from '../models';

export default function EditRoleDecorators() {
  const EditRoleDecorators: Array<CombineDecoratorType> = [
    Put(':id'),
    SetMetadata('permissions', [ROLES.EDIT]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: RoleResponse }),
  ];

  return CombineDecorators(EditRoleDecorators);
}
