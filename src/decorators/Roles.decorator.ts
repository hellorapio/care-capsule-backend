import { SetMetadata } from '@nestjs/common';

const Roles = (...roles: string[]) => SetMetadata('Roles', roles);

export default Roles;
