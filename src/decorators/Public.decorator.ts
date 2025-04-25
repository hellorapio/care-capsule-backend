import { SetMetadata } from '@nestjs/common';

const Public = () => SetMetadata('Public', true);

export default Public;
