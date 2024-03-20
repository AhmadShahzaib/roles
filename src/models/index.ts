export * from './roleRequest.model';
export * from './roleResponse.model';
export * from './statusRequest.model';

export const searchableAttributes = ['roleName', 'description'];

export const searchableIds = ['id', 'tenantId'];

export const sortableAttributes = ['id', 'roleName', 'tenantId', 'isActive'];
