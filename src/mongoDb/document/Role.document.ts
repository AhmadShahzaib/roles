import { Document, Schema } from 'mongoose';
// import PermissionDocument from '@shafiqrathore/logeld-tenantbackend-common-future';

export default interface RoleDocument extends Document {
  roleName: string;
  tenantId?: string;
  description: string;
  permissions:[string] | string[];
  // permissions?: PermissionDocument['_id'];
  isActive: boolean;
}
