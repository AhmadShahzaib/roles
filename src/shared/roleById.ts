import { RoleResponse } from '../models';
import { HttpException, NotFoundException } from '@nestjs/common';
import { RolesService } from 'app.service';
import { FilterQuery } from 'mongoose';
import RoleDocument from 'mongoDb/document/Role.document';
export const getRoleById = async (
  roleService: RolesService,
  id: string,
  option: FilterQuery<RoleDocument> = {},
): Promise<RoleResponse> => {
  try {
    const role = await roleService.findRoleById(id, option);
    if (role) {
      const responseRole = new RoleResponse(role);
      responseRole.permissions = await roleService.populatePermission(
        responseRole.permissions,
      );
      return responseRole
    } else {
      throw new NotFoundException(`Role not found`);
    }
  } catch (err) {
    throw err;
  }
};
