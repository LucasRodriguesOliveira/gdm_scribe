import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindContactByIdProxy } from '../../../infrastructure/usecase-proxy/contact/find-contact-by-id.proxy';
import { FindContactByIdUseCase } from '../../../application/usecase/contact/find-contact-by-id.usecase';
import { ListContactProxy } from '../../../infrastructure/usecase-proxy/contact/list-contact.proxy';
import { ListContactUseCase } from '../../../application/usecase/contact/list-contact.usecase';
import { CreateContactProxy } from '../../../infrastructure/usecase-proxy/contact/create-contact.proxy';
import { CreateContactUseCase } from '../../../application/usecase/contact/create-contact.usecase';
import { FindContactByIdPresenter } from './presenter/find-contact-by-id.presenter';
import { Contact } from '../../../domain/model/contact.model';
import { PresenterInterceptor } from '../../../infrastructure/common/interceptor/presenter.interceptor';
import {
  ListContactPresenter,
  ListItemContactPresenter,
} from './presenter/list-contact.presenter';
import { QueryContactDto } from './dto/query-contact.dto';
import { CreateContactPresenter } from './presenter/create-contact.presenter';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'node:fs';
import { BulkCreateContactProxy } from '../../../infrastructure/usecase-proxy/contact/bulk-create-contact.proxy';
import { BulkCreateContactUseCase } from '../../../application/usecase/contact/bulk-create-contact.usecase';
import { JwtGuard } from '../../../infrastructure/common/guard/jwt.guard';
import { GetUser } from '../../../infrastructure/common/decorator/get-user.decorator';
import { UserModel } from '../../../domain/model/user.model';
import { IContactResultList } from '../../../domain/service/contact/contact-result-list.interface';
import { plainToInstance } from 'class-transformer';
import { CreateContactDto } from './dto/create-contact.dto';
import { Mb } from '../../../infrastructure/common/constants/byte.size';

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
  @ApiBearerAuth()
  @UseInterceptors(new PresenterInterceptor(ListContactPresenter))
  @UseGuards(JwtGuard)
  public async list(
    @Query(ValidationPipe) queryContactDto: QueryContactDto,
    @GetUser() connectedUser: UserModel,
  ): Promise<IContactResultList> {
    const result = await this.listContactUseCase.run(
      queryContactDto,
      connectedUser.id,
    );

    result.items = plainToInstance(ListItemContactPresenter, result.items);

    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Get(':contactId')
  @ApiOkResponse({
    type: FindContactByIdPresenter,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @UseInterceptors(new PresenterInterceptor(FindContactByIdPresenter))
  public async findById(
    @Param('contactId') contactId: string,
    @GetUser() user: UserModel,
  ): Promise<Contact> {
    return this.findContactByIdUseCase.run(contactId, user.id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiCreatedResponse({
    type: CreateContactPresenter,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @UseInterceptors(new PresenterInterceptor(CreateContactPresenter))
  public async create(
    @Body(ValidationPipe) createContactDto: CreateContactDto,
    @GetUser() user: UserModel,
  ): Promise<Contact> {
    console.log(ContactController.name, user);
    return this.createContactUseCase.run(createContactDto, user.id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('integration')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [Contact],
  })
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  public async integration(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * Mb })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @GetUser() user: UserModel,
  ) {
    const fileStream = createReadStream(file.path);

    return this.bulkCreateContactUseCase.run(fileStream, user.id);
  }
}
