import { HttpStatus, Patch, SetMetadata } from '@nestjs/common';

import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  ROLES,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { RoleResponse } from 'models';

export default function IsActiveDecorators() {
  const IsActiveDecorators: Array<CombineDecoratorType> = [
    Patch('/status/:id'),
    SetMetadata('permissions', [ROLES.DEACTIVATE]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: RoleResponse }),
    ApiParam({
      name: 'id',
      description: 'The ID of the Role you want to change the status of',
    }),
  ];
  return CombineDecorators(IsActiveDecorators);
}
