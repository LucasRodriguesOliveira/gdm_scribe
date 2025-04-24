import { Exclude, Expose } from 'class-transformer';
import { Contact } from '../../../../domain/model/contact.model';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class ListItemContactPresenter extends Contact {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  state: string;
}

export class ListContactPresenter {
  @Expose()
  @ApiProperty({
    type: ListItemContactPresenter,
    isArray: true,
  })
  items: ListItemContactPresenter[];

  @Expose()
  @ApiProperty({
    type: Number,
  })
  page: number;

  @Expose()
  @ApiProperty({
    type: Number,
  })
  pageSize: number;

  @Expose()
  @ApiProperty({
    type: Number,
  })
  total: number;
}
