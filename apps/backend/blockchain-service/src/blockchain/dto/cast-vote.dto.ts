import { IsString, IsArray, IsNotEmpty, ArrayMaxSize, ArrayMinSize } from 'class-validator';

export class CastVoteDto {
  @IsArray()
  @ArrayMinSize(8)
  @ArrayMaxSize(8)
  proof: string[];

  @IsString()
  @IsNotEmpty()
  nullifier: string;

  @IsString()
  @IsNotEmpty()
  encryptedVote: string;
}
