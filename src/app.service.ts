import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  BaseService,
  mapMessagePatternResponseToException,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, Schema } from 'mongoose';
import RoleDocument from './mongoDb/document/Role.document';
import { RoleRequest } from './models';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, NotFoundError } from 'rxjs';
import { isArray } from 'lodash';
@Injectable()
export class RolesService extends BaseService<RoleDocument> {
  constructor(
    @InjectModel('Roles') private readonly roleModel: Model<RoleDocument>,
    @Inject('PERMISSIONS_SERVICE')
    private readonly permissionsClient: ClientProxy,
    @Inject('USER_SERVICE')
    private readonly userClient: ClientProxy,
  ) {
    super();
  }

  add = async (role: RoleRequest): Promise<RoleDocument> => {
    try {
      return await this.roleModel.create(role);
    } catch (err) {
      Logger.error(err.message, err.stack);
      Logger.log({ role });
      throw err;
    }
  };

  find = (options: FilterQuery<RoleDocument>) => {
    try {
      options.isDeleted = false;
      return this.roleModel.find(options);
    } catch (err) {
      Logger.error(err.message, err.stack);
      Logger.log({ options });
      throw err;
    }
  };

  deleteOne = async (id: string) => {
    try {
      return await this.roleModel.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
        },
        {
          new: true,
        },
      );
    } catch (err) {
      Logger.error(err.message, err.stack);
      Logger.log({ id });
      throw err;
    }
  };

  updateRole = async (
    id: string,
    editRoleRequestData: RoleRequest,
  ): Promise<RoleDocument> => {
    try {
      return await this.roleModel
        .findByIdAndUpdate(id, editRoleRequestData, {
          new: true,
        })
        .and([{ isDeleted: false }]);
    } catch (err) {
      Logger.error(err.message, err.stack);
      Logger.log({ id, editRoleRequestData });
      throw err;
    }
  };

  count = (options: FilterQuery<RoleDocument>) => {
    try {
      options.isDeleted = false;
      return this.roleModel.count(options).exec();
    } catch (err) {
      Logger.error(err.message, err.stack);
      Logger.log({ options });
      throw err;
    }
  };

  findRoleById = async (
    id: string,
    options: FilterQuery<RoleDocument> = {},
  ): Promise<RoleDocument> => {
    try {
      return await this.roleModel
        .findById(id)
        .and([{ isDeleted: false, ...options }]);
    } catch (err) {
      Logger.error(err.message, err.stack);
      Logger.log({ id });
      throw err;
    }
  };

  // TODO: Replace below any type with PermissionResponse type after it is available in common Package
  populatePermission = async (id: string[]): Promise<any> => {
    try {
      const resp = await firstValueFrom(
        this.permissionsClient.send({ cmd: 'get_permission' }, id),
      );
      if (resp.isError) {
        Logger.log(
          'Error occurred in get_permission Message Pattern of Permissions Service and Logged in populatePermission of Roles Service',
        );
        mapMessagePatternResponseToException(resp);
      }
      return resp.data;
    } catch (error) {
      Logger.log({ message: error.message, stack: error.stack });
      throw error;
    }
  };

  isRoleAssignedUser = async (id: Schema.Types.ObjectId): Promise<boolean> => {
    try {
      const resp = await firstValueFrom(
        this.userClient.send({ cmd: 'is_role_assigned_user' }, id),
      );
      if (resp.isError) {
        mapMessagePatternResponseToException(resp);
      }
      return resp.data;
    } catch (err) {
      Logger.log(err);
      throw err;
    }
  };

  getRoleWithPermission = async (id: string): Promise<RoleDocument> => {
    try {
      return await this.roleModel.findOne({ permissions: id });
    } catch (err) {
      Logger.error(err.message, err.stack);
      throw err;
    }
  };

  validatePermissionIds = async (id: string[]): Promise<boolean> => {
    try {
      const resp = await firstValueFrom(
        this.permissionsClient.send({ cmd: 'validate_ids' }, id),
      );
      if (resp.isError) {
        mapMessagePatternResponseToException(resp);
      }
      return resp.data;
    } catch (error) {
      Logger.log({ message: error.message, stack: error.stack });
      throw error;
    }
  };

  findOne = async (
    options: FilterQuery<RoleDocument>,
  ): Promise<RoleDocument> => {
    try {
      return await this.roleModel.findOne(options);
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  roleStatus = async (id: string, status: boolean): Promise<RoleDocument> => {
    try {
      return await this.roleModel
        .findByIdAndUpdate(
          id,
          { isActive: status },
          {
            new: true,
          },
        )
        .and([{ isDeleted: false }]);
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
}
