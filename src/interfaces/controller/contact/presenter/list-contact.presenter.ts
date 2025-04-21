import { Exclude, Expose } from 'class-transformer';
import { Contact } from '../../../../domain/model/contact.model';

@Exclude()
export class ListContactPresenter extends Contact {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
