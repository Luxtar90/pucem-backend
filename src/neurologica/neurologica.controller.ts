import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  Res,
  Logger,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProduces,
  ApiConsumes,
} from '@nestjs/swagger';
import { Response as ExpressResponse, Request } from 'express';
import type { Express } from 'express'; // ⬅️ TIPOS para Multer

import { NeurologicaService } from '@/neurologica/neurologica.service';
import { CreateNeurologicaDto } from '@/neurologica/dto/create-neurologica.dto';
import { UpdateNeurologicaDto } from '@/neurologica/dto/update-neurologica.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { Role } from '@/users/entities/user.entity';

import { PdfService } from '@/common/services/pdf.service';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// ---------- helpers para Multer ----------
// eslint-disable-next-line @typescript-eslint/ban-types
function fileNameEdit(_: any, file: Express.Multer.File, cb: Function) {
  const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, `${file.fieldname}-${unique}${extname(file.originalname)}`);
}
// eslint-disable-next-line @typescript-eslint/ban-types
function imageFilter(_: any, file: Express.Multer.File, cb: Function) {
  if (/^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error('Solo imágenes (png/jpg/jpeg/gif/webp)'), false);
}

@ApiTags('Neurológica')
@Controller('neurologica')
export class NeurologicaController {
  private readonly logger = new Logger(NeurologicaController.name);

  constructor(
    private readonly neurologicaService: NeurologicaService,
    private readonly pdfService: PdfService,
  ) {}

  // ----------------- CREAR (JSON puro) -----------------
  @Post()
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Crear nueva evaluación neurológica' })
  @ApiResponse({
    status: 201,
    description: 'Evaluación neurológica creada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiBody({ type: CreateNeurologicaDto })
  create(@Body() dto: CreateNeurologicaDto) {
    return this.neurologicaService.create(dto);
  }

  // ----------------- CREAR (multipart: JSON + IMÁGENES) -----------------
  @Post('with-images')
  @Auth(Role.USER)
  @ApiOperation({
    summary: 'Crear evaluación neurológica con imágenes (multipart/form-data)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'vistaAnterior', maxCount: 1 },
        { name: 'vistaPosterior', maxCount: 1 },
        { name: 'vistaLateralDerecha', maxCount: 1 },
        { name: 'vistaLateralIzquierda', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: 'uploads/neurologica',
          filename: fileNameEdit,
        }),
        fileFilter: imageFilter,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      },
    ),
  )
  @ApiBody({
    description:
      'Enviar "data" como string JSON del CreateNeurologicaDto + archivos de imágenes opcionales',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'JSON de CreateNeurologicaDto' },
        vistaAnterior: { type: 'string', format: 'binary' },
        vistaPosterior: { type: 'string', format: 'binary' },
        vistaLateralDerecha: { type: 'string', format: 'binary' },
        vistaLateralIzquierda: { type: 'string', format: 'binary' },
      },
      required: ['data'],
    },
  })
  async createWithImages(
    @Body('data') data: string,
    @UploadedFiles()
    files: {
      vistaAnterior?: Express.Multer.File[];
      vistaPosterior?: Express.Multer.File[];
      vistaLateralDerecha?: Express.Multer.File[];
      vistaLateralIzquierda?: Express.Multer.File[];
    },
    @Req() req: Request,
  ) {
    const dto: CreateNeurologicaDto = JSON.parse(data || '{}');

    const host = `${req.protocol}://${req.get('host')}`;
    const urlFor = (f?: Express.Multer.File[]) =>
      f?.[0] ? `${host}/uploads/neurologica/${f[0].filename}` : undefined;

    const images = {
      vistaAnteriorUrl: urlFor(files.vistaAnterior),
      vistaPosteriorUrl: urlFor(files.vistaPosterior),
      vistaLateralDerechaUrl: urlFor(files.vistaLateralDerecha),
      vistaLateralIzquierdaUrl: urlFor(files.vistaLateralIzquierda),
    };

    return this.neurologicaService.create(dto, images);
  }

  // ----------------- LISTADO -----------------
  @Get()
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Obtener todas las evaluaciones neurológicas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de evaluaciones neurológicas obtenida exitosamente.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Límite de elementos por página',
    example: 10,
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.neurologicaService.findAll(paginationDto);
  }

  // ----------------- POR CI -----------------
  @Get('by-ci/:ci')
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Obtener evaluaciones neurológicas por cédula' })
  @ApiResponse({
    status: 200,
    description: 'Evaluaciones neurológicas encontradas por cédula.',
  })
  @ApiParam({
    name: 'ci',
    description: 'Cédula de identidad del paciente',
    example: '1234567890',
  })
  findByCI(@Param('ci') ci: string) {
    return this.neurologicaService.findByCI(ci);
  }

  // ----------------- DESCARGA PDF (TODOS) -----------------
  @Get('download')
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Download all neurologic evaluations as PDF' })
  @ApiProduces('application/pdf')
  async downloadNeurologicas(@Res() res: ExpressResponse) {
    try {
      this.logger.log('Iniciando descarga de evaluaciones neurológicas');

      const { neurologicas } = await this.neurologicaService.findAll({
        limit: 1000,
        page: 1,
      });
      this.logger.log(`Encontradas ${neurologicas.length} evaluaciones`);

      const buffer = await this.pdfService.generatePdf(
        neurologicas,
        'Evaluaciones Neurológicas',
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=neurologicas.pdf',
      });

      return res.send(buffer);
    } catch (error: any) {
      this.logger.error('Error al generar PDF:', error);
      return res.status(500).json({
        message: 'Error al generar PDF',
        error: error?.message ?? String(error),
      });
    }
  }

  // ----------------- DESCARGA PDF (UNA) -----------------
  @Get('download/:id')
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Download one neurologic evaluation as PDF' })
  @ApiProduces('application/pdf')
  async downloadOneNeurologica(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: ExpressResponse,
  ) {
    const item = await this.neurologicaService.findOne(id);
    const buffer = await this.pdfService.generatePdf(
      [item],
      'Evaluación Neurológica',
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=neurologica-${id}.pdf`,
    });
    return res.send(buffer);
  }

  // ----------------- OBTENER UNA -----------------
  @Get(':id')
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Obtener evaluación neurológica por ID' })
  @ApiResponse({
    status: 200,
    description: 'Evaluación neurológica encontrada.',
  })
  @ApiResponse({
    status: 404,
    description: 'Evaluación neurológica no encontrada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la evaluación neurológica',
    format: 'uuid',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.neurologicaService.findOne(id);
  }

  // ----------------- ACTUALIZAR -----------------
  @Patch(':id')
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Actualizar evaluación neurológica' })
  @ApiResponse({
    status: 200,
    description: 'Evaluación neurológica actualizada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Evaluación neurológica no encontrada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la evaluación neurológica',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateNeurologicaDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNeurologicaDto,
  ) {
    return this.neurologicaService.update(id, dto);
  }

  // ----------------- ELIMINAR -----------------
  @Delete(':id')
  @Auth(Role.USER)
  @ApiOperation({ summary: 'Eliminar evaluación neurológica' })
  @ApiResponse({
    status: 200,
    description: 'Evaluación neurológica eliminada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Evaluación neurológica no encontrada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la evaluación neurológica',
    format: 'uuid',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.neurologicaService.remove(id);
  }
}
