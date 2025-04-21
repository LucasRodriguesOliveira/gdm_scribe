import { Exclude, Expose } from 'class-transformer';
import { Contact } from '../../../../domain/model/contact.model';

@Exclude()
export class CreateContactPresenter extends Contact {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  state: string;
}
