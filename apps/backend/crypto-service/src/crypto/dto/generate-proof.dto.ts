import { IsString, IsArray, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class GenerateProofDto {
  @IsString()
  @IsNotEmpty()
  secret: string;

  @IsString()
  @IsNotEmpty()
  merkleRoot: string;

  @IsString()
  @IsNotEmpty()
  electionId: string;

  @IsArray()
  @ArrayMinSize(20)
  path: string[];

  @IsArray()
  @ArrayMinSize(20)
  direction: string[];
}
