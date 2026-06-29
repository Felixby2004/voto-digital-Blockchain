import { PartialType } from '@nestjs/mapped-types';
import { CreateEleccionDto } from './create-eleccion.dto';

export class UpdateEleccionDto extends PartialType(CreateEleccionDto) {}