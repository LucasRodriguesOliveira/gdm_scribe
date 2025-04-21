import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FindContactByIdProxy } from '../../../infrastructure/usecase-proxy/contact/find-contact-by-id.proxy';
import { FindContactByIdUseCase } from '../../../application/usecase/contact/find-contact-by-id.usecase';
import { ListContactProxy } from '../../../infrastructure/usecase-proxy/contact/list-contact.proxy';
import { ListContactUseCase } from '../../../application/usecase/contact/list-contact.usecase';
import { CreateContactProxy } from '../../../infrastructure/usecase-proxy/contact/create-contact.proxy';
import { CreateContactUseCase } from '../../../application/usecase/contact/create-contact.usecase';
import { FindContactByIdPresenter } from './presenter/find-contact-by-id.presenter';
import { Contact } from '../../../domain/model/contact.model';
import { PresenterInterceptor } from '../../../infrastructure/common/interceptor/presenter.interceptor';
import { ListContactPresenter } from './presenter/list-contact.presenter';
import { QueryContactDto } from './dto/query-contact.dto';
import { CreateContactPresenter } from './presenter/create-contact.presenter';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'node:fs';
import { BulkCreateContactProxy } from '../../../infrastructure/usecase-proxy/contact/bulk-create-contact.proxy';
import { BulkCreateContactUseCase } from '../../../application/usecase/contact/bulk-create-contact.usecase';

@Controller('contact')
@ApiTags('contact')
export class ContactController {
  constructor(
    @Inject(FindContactByIdProxy.Token)
    private readonly findContactByIdUseCase: FindContactByIdUseCase,
    @Inject(ListContactProxy.Token)
    private readonly listContactUseCase: ListContactUseCase,
    @Inject(CreateContactProxy.Token)
    private readonly createContactUseCase: CreateContactUseCase,
    @Inject(BulkCreateContactProxy.Token)
    private readonly bulkCreateContactUseCase: BulkCreateContactUseCase,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOkResponse({
    type: [ListContactPresenter],
  })
  @UseInterceptors(new PresenterInterceptor(ListContactPresenter))
  public async list(
    @Query(ValidationPipe) queryContactDto: QueryContactDto,
  ): Promise<Contact[]> {
    return this.listContactUseCase.run(queryContactDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':contactId')
  @ApiOkResponse({
    type: FindContactByIdPresenter,
  })
  @UseInterceptors(new PresenterInterceptor(FindContactByIdPresenter))
  public async findById(
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<Contact> {
    return this.findContactByIdUseCase.run(contactId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiCreatedResponse({
    type: CreateContactPresenter,
  })
  @UseInterceptors(new PresenterInterceptor(CreateContactPresenter))
  public async create(
    @Body() createContactDto: Partial<Contact>,
  ): Promise<Contact> {
    return this.createContactUseCase.run(createContactDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('integration')
  @UseInterceptors(FileInterceptor('file'))
  public async integration(@UploadedFile() file: Express.Multer.File) {
    const fileStream = createReadStream(file.path);

    return this.bulkCreateContactUseCase.run(fileStream);
  }
}
