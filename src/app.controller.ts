import {
  Controller,
  Body,
  Res,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Logger,
  HttpException,
  NotFoundException,
  Query,
  Req,
  ConflictException,
  UseInterceptors,
} from '@nestjs/common';
import {
  RoleRequest,
  RoleResponse,
  searchableAttributes,
  searchableIds,
  sortableAttributes,
  StatusRequest,
} from './models';
import { Response, Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import AddRoleDecorators from './decorators/addRole';
import { FilterQuery, Schema, Types } from 'mongoose';
import GetRolesDecorators from './decorators/getRoles';
import EditRoleDecorators from './decorators/update';
import DeleteRoleDecorators from './decorators/remove';
import GetSingleRoleDecorators from './decorators/getRoleById';
import { getRoleById } from 'shared/roleById';
import moment from 'moment-timezone';
import {
  BaseController,
  ListingParams,
  ListingParamsValidationPipe,
  MessagePatternResponseInterceptor,
  MongoIdValidationPipe,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import RoleDocument from 'mongoDb/document/Role.document';
import IsActiveDecorators from 'decorators/isActive';

@Controller('roles')
@ApiTags('Roles')
export class RolesController extends BaseController {
  constructor(private readonly roleService: RolesService) {
    super();
  }

  // @------------------- Add role API controller -------------------
  @AddRoleDecorators()
  async addRole(
    @Body() addRoleRequestData: RoleRequest,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    Logger.log(
      `${request.method} request received from ${request.ip} for ${
        request.originalUrl
      } by: ${
        !response.locals.user ? 'Unauthorized User' : response.locals.user.id
      }`,
    );
    try {
      const { tenantId } = request.user ?? ({ tenantId: undefined } as any);
      addRoleRequestData.tenantId = tenantId;
      Logger.log(
        `Validating all permission IDs provided by calling permission service`,
      );
      const option = {
        $and: [
          {
            roleName: {
              $regex: new RegExp(`^${addRoleRequestData.roleName}`, 'i'),
            },
          },
          { isDeleted: false },
        ],
      };
      const roleExist = await this.roleService.findOne(option);
      if (roleExist && Object.keys(roleExist).length > 0) {
        Logger.log(`roleName already exists`);
        throw new ConflictException(`Role Name already exists`);
      }
      await this.roleService.validatePermissionIds(
        addRoleRequestData.permissions,
      );
      Logger.log(`Validation completed without errors. Calling Add method.`);
      const roleDoc = await this.roleService.add(addRoleRequestData);
      if (!roleDoc) {
        Logger.log(`Unknown error while adding role occurred.`);
        throw new InternalServerErrorException(
          'Unknown error while adding role occurred.',
        );
      }

      Logger.log(`Role added successfully. Creating response object.`);
      const result: RoleResponse = new RoleResponse(roleDoc);
      return response.status(HttpStatus.CREATED).send({
        message: 'Role has been created successfully',
        data: result,
      });
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  // @------------------- Get role list API controller -------------------
  @GetRolesDecorators()
  async getRoles(
    @Query(ListingParamsValidationPipe) queryParams: ListingParams,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    Logger.log(
      `${request.method} request received from ${request.ip} for ${
        request.originalUrl
      } by: ${
        !response.locals.user ? 'Unauthorized User' : response.locals.user.id
      }`,
    );
    try {
      const options: FilterQuery<RoleDocument> = {};
      const { search, orderBy, orderType, pageNo, limit } = queryParams;
      const { timeZone } = request.user ?? ({ timeZone: '' } as any);
      if (search) {
        options.$or = [];
        if (Types.ObjectId.isValid(search)) {
          searchableIds.forEach((attribute) => {
            options.$or.push({ [attribute]: new RegExp(search, 'i') });
          });
        }
        searchableAttributes.forEach((attribute) => {
          options.$or.push({ [attribute]: new RegExp(search, 'i') });
        });
      }

      Logger.log(
        `Calling find method of Role Service with search options to get query.`,
      );
      const query = this.roleService.find(options);

      Logger.log(`Adding sort options to query.`);
      if (orderBy && sortableAttributes.includes(orderBy)) {
        query.collation({ locale: 'en' }).sort({ [orderBy]: orderType ?? 1 });
      } else {
        query.sort({ createdAt: 1 });
      }

      Logger.log(
        `Calling count method of Role Service with search options to get total count of records.`,
      );
      const total = await this.roleService.count(options);

      Logger.log(
        `Executing query with pagination. Skipping: ${
          ((pageNo ?? 1) - 1) * (limit ?? 10)
        }, Limit: ${limit ?? 10}`,
      );
      let queryResponse;
      if (!limit || !isNaN(limit)) {
        query.skip(((pageNo ?? 1) - 1) * (limit ?? 10)).limit(limit ?? 10);
      }
      queryResponse = await query.exec();

      const responseData: RoleResponse[] = [];
      for (const role of queryResponse) {
        const permissions = await this.roleService.populatePermission(
          role.permissions,
        );
        const jsonRole = role.toJSON() as RoleResponse;
        jsonRole.id = role.id;
        jsonRole.permissions = permissions;
        if (timeZone?.tzCode) {
          jsonRole.createdAt = moment
            .tz(jsonRole.createdAt, timeZone?.tzCode)
            .format('DD/MM/YYYY h:mm a');
        }
        const roleResponse = new RoleResponse(jsonRole);
        responseData.push(roleResponse);
      }

      response.status(HttpStatus.OK).send({
        data: responseData,
        total,
        page: pageNo ?? 1,
        last_page: Math.ceil(
          total /
            (limit && limit.toString().toLowerCase() === 'all'
              ? total
              : limit ?? 10),
        ),
      });
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  // @------------------- Edit role API controller -------------------
  @EditRoleDecorators()
  async update(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() editRoleRequestData: RoleRequest,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    Logger.log(
      `${request.method} request received from ${request.ip} for ${
        request.originalUrl
      } by: ${
        !response.locals.user ? 'Unauthorized User' : response.locals.user.id
      }`,
    );
    try {
      const option = {
        roleName: {
          $regex: new RegExp(`^${editRoleRequestData.roleName}`, 'i'),
        },
        $and: [{ _id: { $ne: id }, isDeleted: false }],
      };
      const roleExist = await this.roleService.findOne(option);
      if (roleExist && Object.keys(roleExist).length > 0) {
        Logger.log(`roleName already exist`);
        throw new ConflictException(`Role Name already exist`);
      }

      Logger.log(
        `Validating all permission IDs provided by calling permission service`,
      );
      await this.roleService.validatePermissionIds(
        editRoleRequestData.permissions,
      );
      Logger.log(`Calling updateUser method of Role Service`);
      const updatedRole = await this.roleService.updateRole(
        id,
        editRoleRequestData,
      );
      if (!updatedRole) {
        throw new NotFoundException(`${id} does not exist`);
      }
      Logger.log(`Role updated successfully. Creating response object.`);
      const result: RoleResponse = new RoleResponse(updatedRole);
      return response.status(200).send({
        message: 'Role has been updated successfully',
        data: result,
      });
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  // @------------------- Delete role API controller -------------------
  // @DeleteRoleDecorators()
  // async remove(
  //   @Param('id', MongoIdValidationPipe) id: string,
  //   @Req() request: Request,
  //   @Res() response: Response,
  // ) {
  //   Logger.log(
  //     `${request.method} request received from ${request.ip} for ${
  //       request.originalUrl
  //     } by: ${
  //       !response.locals.user ? 'Unauthorized User' : response.locals.user.id
  //     }`,
  //   );
  //   try {
  //     Logger.log(
  //       `Calling findRoleById method of Role Service with id: ${id} to check if role with id exists.`,
  //     );
  //     const role = await this.roleService.findRoleById(id);
  //     if (!role) {
  //       throw new NotFoundException(`${id} not exist`);
  //     }

  //     Logger.log(
  //       `Role found successfully.
  //       Calling roleAssignedUser method of Role Service to check if this role is assigned to an existing active user before deleting`,
  //     );
  //     const user: boolean = await this.roleService.isRoleAssignedUser(role.id);
  //     if (user) {
  //       throw new ConflictException(`${id} assigned to User`);
  //     }
  //     Logger.log(
  //       `No active user is assigned this role. OK to delete. Calling deleteOne of Role Service.`,
  //     );
  //     const result = await this.roleService.deleteOne(id);

  //     if (!result) {
  //       throw new NotFoundException(`${id} not exist`);
  //     }

  //     Logger.log(`Role Deleted Successfully.`);
  //     return response.status(200).send({
  //       message: 'Role deleted successfully',
  //     });
  //   } catch (error) {
  //     Logger.error({ message: error.message, stack: error.stack });
  //     throw error;
  //   }
  // }

  // @------------------- Get ONE role API controller -------------------
  @GetSingleRoleDecorators()
  async getRoleById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    Logger.log(
      `${request.method} request received from ${request.ip} for ${
        request.originalUrl
      } by: ${
        !response.locals.user ? 'Unauthorized User' : response.locals.user.id
      }`,
    );
    try {
      Logger.log(`Calling getRoleById method from shared.`);
      const responseRole = await getRoleById(this.roleService, id);

      if (responseRole) {
        Logger.log(`Role found successfully.`);
        return response.status(HttpStatus.OK).send({
          message: 'Role Found',
          data: responseRole,
        });
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  @IsActiveDecorators()
  async userStatus(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() request: StatusRequest,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      const { isActive } = request;
      // const { permissions } = req.user ?? ({ permissions: undefined } as any);
      // const permission = permissions.find((permission) => {
      //   return permission.page === 'users';
      // });
      // if(permission){
      //   if (isActive && !permission.canActivate) {
      //     throw new ForbiddenException("Don't have Permission to Activate");
      //   }
      //   if (!isActive && !permission.canDeactivate) {
      //     throw new ForbiddenException("Don't have Permission to DeActivate");
      //   }
      const role = await this.roleService.roleStatus(id, isActive);
      if (role) {
        const result: RoleResponse = new RoleResponse(role);
        if (result) {
          return response.status(200).send({
            message: 'Role status has been changed successfully',
            data: result,
          });
        }
      } else {
        throw new NotFoundException(`id does not exist`);
      }
      // }
      // else{
      //   throw new ForbiddenException("Don't have Permission to Access this resource");
      // }
    } catch (error) {
      Logger.error(error.message, error.stack);
      throw error;
    }
  }

  // **************************** MICROSERVIE METHODS ****************************

  @UseInterceptors(MessagePatternResponseInterceptor)
  @MessagePattern({ cmd: 'get_role_by_id' })
  async tcp_getRoleById(id: string): Promise<RoleResponse | HttpException> {
    try {
      const role = await getRoleById(this.roleService, id);
      return role;
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      return error;
    }
  }

  @UseInterceptors(MessagePatternResponseInterceptor)
  @MessagePattern({ cmd: 'get_permission_assign_role' })
  async tcp_roleAssignedUser(id: string): Promise<boolean> {
    const user = await this.roleService.getRoleWithPermission(id);
    if (user && user.isActive) {
      return true;
    } else {
      return false;
    }
  }
}
