import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConsultationService } from '@/consultation/consultation.service';
import { CreateConsultationInitialDto } from '@/consultation/dto/create-consultation-initial.dto';
import { CreateConsultationSubsequentDto } from '@/consultation/dto/create-consultation-subsequent.dto';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PdfService } from '@/common/services/pdf.service'; // Corregir importación

// Extender la interfaz Request para incluir el usuario
interface RequestWithUser extends Request {
  user?: {
    id: string;
    // ... otros campos del usuario si los hay
  };
}

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationController {
  constructor(
    private readonly consultationService: ConsultationService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('initial')
  @ApiOperation({ summary: 'Create a consultation initial' })
  @ApiBody({ type: CreateConsultationInitialDto })
  create(
    @Body() createConsultationInitialDto: CreateConsultationInitialDto,
    @Req() request: RequestWithUser,
  ) {
    // Obtener el userId del token
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    return this.consultationService.createInitial(
      createConsultationInitialDto,
      userId,
    );
  }

  @Post('subsequent')
  @ApiOperation({
    summary: 'Create a consultation subsequent based in a initial',
  })
  @ApiBody({ type: CreateConsultationSubsequentDto })
  createSubsequent(
    @Body() createConsultationSubsequentDto: CreateConsultationSubsequentDto,
  ) {
    return this.consultationService.createSubsequent(
      createConsultationSubsequentDto,
    );
  }

  @Get('lastsubsequent/:id')
  @ApiOperation({ summary: 'Obtain the last subsequent based in a initial ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description:
      'ID of the consultation initial to be searched its last subsequent one, lol so hard',
  })
  findLastSubsequent(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultationService.findLastSubsequent(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consultationService.remove(id);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener todas las consultas de un usuario específico',
  })
  @ApiParam({ name: 'userId', type: String, description: 'ID del usuario' })
  findAllByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.consultationService.findAllByUser(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las consultas' })
  findAll() {
    return this.consultationService.findAll();
  }

  @Get('download')
  @ApiOperation({ summary: 'Download all consultations as PDF' })
  async downloadConsultations(@Res() res: Response) {
    const consultations = await this.consultationService.findAll();
    const buffer = await this.pdfService.generatePdf(
      consultations.consultations,
      'Consulta Externa',
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=consultations.pdf',
    });

    res.send(buffer);
  }

  // consultations.controller.ts
  @Get('download/:id')
  @ApiOperation({ summary: 'Download one external consultation as PDF' })
  async downloadOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const one = await this.consultationService.findOneInitial(id);
    const buffer = await this.pdfService.generatePdf([one], 'Consulta Externa');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=consulta-${id}.pdf`,
    });
    return res.send(buffer);
  }
}
