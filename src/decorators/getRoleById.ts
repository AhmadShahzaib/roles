import { Get, HttpStatus, SetMetadata } from '@nestjs/common';
import { RoleResponse } from '../models';
import {
  CombineDecorators,
  CombineDecoratorType,
  ROLES,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

export default function GetSingleRoleDecorators() {
  const GetSingleRoleDecorators: Array<CombineDecoratorType> = [
    Get(':id'),
    SetMetadata('permissions', [ROLES.GETBYID]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: RoleResponse }),
  ];
  return CombineDecorators(GetSingleRoleDecorators);
}
