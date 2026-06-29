import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class VerifyProofDto {
  @IsArray()
  @ArrayMinSize(8)
  @ArrayMaxSize(8)
  proof: string[];

  @IsArray()
  publicSignals: any[];
}
