// dto/create-neurologica.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  ValidateNested,
  Min,
  IsArray,
  IsObject,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class AlteracionesMarchaDto {
  @ApiProperty({ description: 'Marcha de Trendelenburg', example: false })
  @IsBoolean()
  @IsOptional()
  marchaTrendelenburg?: boolean;

  @ApiProperty({ description: 'Marcha en tuerca', example: false })
  @IsBoolean()
  @IsOptional()
  marchaTuerca?: boolean;

  @ApiProperty({ description: 'Marcha atáxica', example: false })
  @IsBoolean()
  @IsOptional()
  marchaAtaxica?: boolean;

  @ApiProperty({ description: 'Marcha en segador', example: false })
  @IsBoolean()
  @IsOptional()
  marchaSegador?: boolean;

  @ApiProperty({ description: 'Marcha en tijeras', example: false })
  @IsBoolean()
  @IsOptional()
  marchaTijeras?: boolean;

  @ApiProperty({ description: 'Marcha tabética', example: false })
  @IsBoolean()
  @IsOptional()
  marchaTabetica?: boolean;

  @ApiProperty({ description: 'Marcha coreica', example: false })
  @IsBoolean()
  @IsOptional()
  marchaCoreica?: boolean;

  @ApiProperty({ description: 'Marcha distónica', example: false })
  @IsBoolean()
  @IsOptional()
  marchaDistonica?: boolean;

  @ApiProperty({
    description: 'Otras alteraciones',
    example: 'Descripción de otras alteraciones',
    required: false,
  })
  @IsString()
  @IsOptional()
  otrasAlteraciones?: string;
}

class RiesgoCaidaDto {
  @ApiProperty({
    description: 'Tiempo del test Timed Up and Go',
    example: '15 segundos',
    required: false,
  })
  @IsString()
  @IsOptional()
  tiempoTimedUpGo?: string;

  @ApiProperty({
    description: 'Riesgo evaluado',
    example: 'moderado',
    required: false,
  })
  @IsString()
  @IsOptional()
  riesgoEvaluado?: string;

  @ApiProperty({
    description: 'Comentarios del riesgo',
    example: 'Comentarios sobre el riesgo de caída',
    required: false,
  })
  @IsString()
  @IsOptional()
  comentariosRiesgo?: string;
}

class BarthelIndexDto {
  @ApiProperty({
    description: 'Puntuación Barthel - Vestirse',
    example: 10,
    required: false,
  })
  @IsInt()
  @IsOptional()
  vestirse?: number;

  @ApiProperty({
    description: 'Puntuación Barthel - Arreglarse',
    example: 5,
    required: false,
  })
  @IsInt()
  @IsOptional()
  arreglarse?: number;

  @ApiProperty({
    description: 'Puntuación Barthel - Deposición',
    example: 10,
    required: false,
  })
  @IsInt()
  @IsOptional()
  deposicion?: number;

  @ApiProperty({
    description: 'Puntuación Barthel - Micción',
    example: 10,
    required: false,
  })
  @IsInt()
  @IsOptional()
  miccion?: number;

  @ApiProperty({
    description: 'Puntuación Barthel - Uso del retrete',
    example: 10,
    required: false,
  })
  @IsInt()
  @IsOptional()
  usoRetrete?: number;

  @ApiProperty({
    description: 'Puntuación Barthel - Trasladarse',
    example: 15,
    required: false,
  })
  @IsInt()
  @IsOptional()
  trasladarse?: number;

  @ApiProperty({
    description: 'Puntuación Barthel - Deambular',
    example: 15,
    required: false,
  })
  @IsInt()
  @IsOptional()
  deambular?: number;

  @ApiProperty({
    description: 'Puntuación Barthel - Escaleras',
    example: 10,
    required: false,
  })
  @IsInt()
  @IsOptional()
  escaleras?: number;
}

class DolorRegistroDto {
  @ApiProperty({
    description: 'Región corporal afectada',
    example: 'lumbar',
  })
  @IsString()
  region: string;

  @ApiProperty({
    description: 'Temporalidad del dolor',
    example: 'crónico',
  })
  @IsString()
  tiempo: string;

  @ApiProperty({
    description: 'Si el dolor se irradia',
    example: true,
  })
  @IsBoolean()
  irradiado: boolean;

  @ApiProperty({
    description: 'Tipo de dolor',
    example: 'punzante',
  })
  @IsString()
  tipo: string;

  @ApiProperty({
    description: 'Escala Visual Numérica (EVN)',
    example: 7,
  })
  @IsNumber()
  evn: number;

  @ApiProperty({
    description: 'Descripción subjetiva del dolor',
    example: 'dolor intenso',
  })
  @IsString()
  subjetiva: string;

  @ApiProperty({
    description: 'Factores que alivian el dolor',
    example: ['reposo', 'calor'],
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsString({ each: true })
  alivian: string[];

  @ApiProperty({
    description: 'Factores que agravan el dolor',
    example: ['movimiento', 'frío'],
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsString({ each: true })
  agravan: string[];

  @ApiProperty({
    description: 'Comentarios adicionales sobre el dolor',
    example: 'empeora por las mañanas',
    required: false,
  })
  @IsString()
  @IsOptional()
  comentarios?: string;
}

export class CreateNeurologicaDto {
  @ApiProperty({ description: 'Nombre del paciente', example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Cédula de identidad', example: '1234567890' })
  @IsString()
  ci: string;

  @ApiProperty({ description: 'Edad del paciente', example: 45 })
  @IsInt()
  @Min(0)
  edad: number;

  @ApiProperty({ description: 'Diagnóstico médico', example: 'Parkinson' })
  @IsString()
  diagnostico: string;

  @ApiProperty({ description: 'Discapacidad', example: 'Motora' })
  @IsString()
  discapacidad: string;

  @ApiProperty({
    description: 'Antecedentes heredofamiliares',
    example: 'Antecedentes familiares de la enfermedad',
    required: false,
  })
  @IsString()
  @IsOptional()
  antecedentesHeredofamiliares?: string;

  @ApiProperty({
    description: 'Antecedentes farmacológicos',
    example: 'Medicamentos actuales',
    required: false,
  })
  @IsString()
  @IsOptional()
  antecedentesFarmacologicos?: string;

  @ApiProperty({
    description: 'Historia nutricional',
    example: 'Historia nutricional del paciente',
    required: false,
  })
  @IsString()
  @IsOptional()
  historiaNutricional?: string;

  @ApiProperty({
    description: 'Alergias',
    example: 'Alergias conocidas',
    required: false,
  })
  @IsString()
  @IsOptional()
  alergias?: string;

  @ApiProperty({
    description: 'Hábitos tóxicos',
    example: 'Tabaquismo, alcoholismo',
    required: false,
  })
  @IsString()
  @IsOptional()
  habitosToxicos?: string;

  @ApiProperty({
    description: 'Antecedentes quirúrgicos',
    example: 'Cirugías previas',
    required: false,
  })
  @IsString()
  @IsOptional()
  quirurgico?: string;

  @ApiProperty({
    description: 'Comunicación',
    example: 'Estado de comunicación del paciente',
    required: false,
  })
  @IsString()
  @IsOptional()
  comunicacion?: string;

  @ApiProperty({
    description: 'Evaluación del dolor (texto libre)',
    example: 'Dolor lumbar intermitente',
    required: false,
  })
  @IsString()
  @IsOptional()
  dolor?: string;

  @ApiProperty({ description: 'Utiliza silla de ruedas', example: false })
  @IsBoolean()
  @IsOptional()
  utilizaSillaRuedas?: boolean;

  @ApiProperty({
    description: 'Amnesis',
    example: 'Descripción de la amnesis',
    required: false,
  })
  @IsString()
  @IsOptional()
  amnesis?: string;

  @ApiProperty({
    description: 'Inicio y evolución del cuadro clínico',
    example: 'Descripción del inicio y evolución',
    required: false,
  })
  @IsString()
  @IsOptional()
  inicioEvolucion?: string;

  @ApiProperty({
    description: 'Entorno familiar',
    example: 'Descripción del entorno familiar',
    required: false,
  })
  @IsString()
  @IsOptional()
  entornoFamiliar?: string;

  @ApiProperty({
    description: 'Mapa corporal con partes seleccionadas y niveles de dolor',
    example: {
      id_parte_cabeza: {
        nivel: 5,
        description: 'Dolor intenso',
      },
      id_parte_torso: {
        nivel: 3,
        description: 'Dolor moderado',
      },
      id_parte_brazo_derecho: {
        nivel: 2,
        description: 'Dolor leve',
      },
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  bodyMap?: Record<string, { nivel: number; description?: string }>; // ID de parte como string y nivel como number;

  @ApiProperty({
    description: 'Registros detallados de dolor',
    example: [
      {
        region: 'lumbar',
        tiempo: 'crónico',
        irradiado: true,
        tipo: 'punzante',
        evn: 7,
        subjetiva: 'dolor intenso',
        alivian: ['reposo'],
        agravan: ['movimiento'],
        comentarios: 'empeora por las mañanas',
      },
    ],
    required: false,
    isArray: true,
    type: DolorRegistroDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DolorRegistroDto)
  @IsOptional()
  dolorRegistros?: DolorRegistroDto[];

  @ApiProperty({
    description: 'Alteraciones de la marcha',
    type: AlteracionesMarchaDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => AlteracionesMarchaDto)
  @IsOptional()
  alteracionesMarcha?: AlteracionesMarchaDto;

  @ApiProperty({
    description: 'Riesgo de caída',
    type: RiesgoCaidaDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => RiesgoCaidaDto)
  @IsOptional()
  riesgoCaida?: RiesgoCaidaDto;

  @ApiProperty({
    description: 'Alcance motor',
    example: 'Descripción del alcance motor',
    required: false,
  })
  @IsString()
  @IsOptional()
  alcanceMotor?: string;

  @ApiProperty({
    description: 'Comentarios del examinador',
    example: 'Comentarios del examinador',
    required: false,
  })
  @IsString()
  @IsOptional()
  comentariosExaminador?: string;

  @ApiProperty({
    description: 'Resumen de resultados',
    example: 'Resumen de los resultados obtenidos',
    required: false,
  })
  @IsString()
  @IsOptional()
  resumenResultados?: string;

  @ApiProperty({
    description: 'Índice de Barthel',
    type: BarthelIndexDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => BarthelIndexDto)
  @IsOptional()
  barthel?: BarthelIndexDto;

  @ApiProperty({
    description:
      'Puntuación total del Índice de Barthel (calculada en backend)',
    example: 95,
    required: false,
  })
  @IsInt()
  @IsOptional()
  barthelTotal?: number;

  // =========================
  // NUEVOS CAMPOS DEL FRONT
  // =========================

  @ApiProperty({
    description: 'Clasificación CIF (códigos)',
    example: ['b110', 'b710'],
    required: false,
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsOptional()
  // Nota: si quieres validar cada string, agrega @IsString({ each: true })
  cif?: { codigo: string; descripcion: string }[];

  @ApiProperty({
    description: 'Observaciones Screening - Vista Anterior',
    example: 'Hombro derecho descendido',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacionesVistaAnterior?: string;

  @ApiProperty({
    description: 'Observaciones Screening - Vista Posterior',
    example: 'Escápulas aladas',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacionesVistaPosterior?: string;

  @ApiProperty({
    description: 'Observaciones Screening - Vista Lateral Derecha',
    example: 'Cabeza adelantada',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacionesVistaLateralDerecha?: string;

  @ApiProperty({
    description: 'Observaciones Screening - Vista Lateral Izquierda',
    example: 'Aumento lordosis',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacionesVistaLateralIzquierda?: string;

  @ApiProperty({
    description: 'Diagnóstico fisioterapéutico',
    example: 'Síndrome doloroso lumbar mecánico',
    required: false,
  })
  @IsString()
  @IsOptional()
  diagnosticoFisioterapeutico?: string;

  @ApiProperty({
    description: 'Plan fisioterapéutico',
    example: 'Terapia manual + fortalecimiento core 8 semanas',
    required: false,
  })
  @IsString()
  @IsOptional()
  planFisioterapeutico?: string;
}
