import { Delete, HttpStatus, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  ErrorType,
  ROLES,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

export default function DeleteRoleDecorators() {
  const DeleteRoleDecorators: Array<CombineDecoratorType> = [
    Delete(':id'),
    SetMetadata('permissions', [ROLES.DELETE]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorType }),
  ];

  return CombineDecorators(DeleteRoleDecorators);
}
