import { Get, HttpStatus, SetMetadata } from '@nestjs/common';
import { RoleResponse } from '../models';
import {
  CombineDecorators,
  CombineDecoratorType,
  ROLES,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { sortableAttributes } from '../models';

export default function GetRolesDecorators() {
  const GetRolesDecorators: Array<CombineDecoratorType> = [
    Get(),
    SetMetadata('permissions', [ROLES.LIST]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: RoleResponse }),
    ApiQuery({
      name: 'search',
      example: 'Search by role name or description or id',
      required: false,
    }),
    ApiQuery({
      name: 'orderBy',
      example: 'Field by which records will be ordered',
      required: false,
      enum: sortableAttributes,
    }),
    ApiQuery({
      name: 'orderType',
      example: 'Ascending (1) or Descending (-1)',
      enum: [-1, 1],
      required: false,
    }),
    ApiQuery({
      name: 'pageNo',
      example: '1',
      description: 'The page number you want to get i.e 1, 2, 3...',
      required: false,
    }),
    ApiQuery({
      name: 'limit',
      example: '10',
      description: 'The number of records you want on one page.',
      required: false,
    }),
  ];
  return CombineDecorators(GetRolesDecorators);
}
