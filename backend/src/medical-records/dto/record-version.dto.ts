import { ApiProperty } from '@nestjs/swagger';

export class RecordVersionDto {
  @ApiProperty({
    description: 'Version ID',
  })
  id: string;

  @ApiProperty({
    description: 'Version number',
  })
  versionNumber: number;

  @ApiProperty({
    description: 'File name',
  })
  fileName: string;

  @ApiProperty({
    description: 'MIME type',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Description',
  })
  description: string;

  @ApiProperty({
    description: 'User who modified the record',
  })
  modifiedBy: {
    id: string;
    name: string;
  };

  @ApiProperty({
    description: 'Reason for the change',
  })
  changeReason: string;

  @ApiProperty({
    description: 'Creation date',
  })
  createdAt: Date;
} 