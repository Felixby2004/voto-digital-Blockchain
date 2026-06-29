import { IsArray, IsNumber, IsNotEmpty } from 'class-validator';

export class MerkleTreeDto {
  @IsNumber()
  depth: number;

  @IsArray()
  @IsNotEmpty()
  leaves: string[];
}
