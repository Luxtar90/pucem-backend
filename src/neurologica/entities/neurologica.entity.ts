import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  // Index,
} from 'typeorm';

@Entity({ name: 'neurologicas' })
export class Neurologica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: false })
  name: string;

  @Column('text', { nullable: false })
  ci: string;

  @Column('int', { nullable: false })
  edad: number;

  @Column('text', { nullable: false })
  diagnostico: string;

  @Column('text', { nullable: false })
  discapacidad: string;

  @Column('text', { nullable: true })
  antecedentesHeredofamiliares?: string;

  @Column('text', { nullable: true })
  antecedentesFarmacologicos?: string;

  @Column('text', { nullable: true })
  historiaNutricional?: string;

  @Column('text', { nullable: true })
  alergias?: string;

  @Column('text', { nullable: true })
  habitosToxicos?: string;

  @Column('text', { nullable: true })
  quirurgico?: string;

  @Column('text', { nullable: true })
  comunicacion?: string;

  @Column('text', { nullable: true })
  dolor?: string;

  @Column('boolean', { default: false })
  utilizaSillaRuedas: boolean;

  @Column('text', { nullable: true })
  amnesis?: string;

  @Column('text', { nullable: true })
  inicioEvolucion?: string;

  @Column('text', { nullable: true })
  entornoFamiliar?: string;

  @Column('jsonb', { nullable: true })
  bodyMap?: any; // partes seleccionadas / niveles - descripcion opcional

  @Column('jsonb', { nullable: true })
  dolorRegistros?: any[]; // {region, tiempo, irradiado, tipo, evn, subjetiva, alivian, agravan, comentarios}

  // Alteraciones de la marcha
  @Column('boolean', { default: false })
  marchaTrendelenburg: boolean;

  @Column('boolean', { default: false })
  marchaTuerca: boolean;

  @Column('boolean', { default: false })
  marchaAtaxica: boolean;

  @Column('boolean', { default: false })
  marchaSegador: boolean;

  @Column('boolean', { default: false })
  marchaTijeras: boolean;

  @Column('boolean', { default: false })
  marchaTabetica: boolean;

  @Column('boolean', { default: false })
  marchaCoreica: boolean;

  @Column('boolean', { default: false })
  marchaDistonica: boolean;

  @Column('text', { nullable: true })
  otrasAlteraciones?: string;

  // Riesgo de caída
  @Column('text', { nullable: true })
  tiempoTimedUpGo?: string;

  @Column('text', { nullable: true })
  riesgoEvaluado?: string;

  @Column('text', { nullable: true })
  comentariosRiesgo?: string;

  // Alcance / comentarios / resumen
  @Column('text', { nullable: true })
  alcanceMotor?: string;

  @Column('text', { nullable: true })
  comentariosExaminador?: string;

  @Column('text', { nullable: true })
  resumenResultados?: string;

  // Índice de Barthel - campos individuales
  @Column('int', { nullable: true })
  barthelVestirse?: number;

  @Column('int', { nullable: true })
  barthelArreglarse?: number;

  @Column('int', { nullable: true })
  barthelDeposicion?: number;

  @Column('int', { nullable: true })
  barthelMiccion?: number;

  @Column('int', { nullable: true })
  barthelUsoRetrete?: number;

  @Column('int', { nullable: true })
  barthelTrasladarse?: number;

  @Column('int', { nullable: true })
  barthelDeambular?: number;

  @Column('int', { nullable: true })
  barthelEscaleras?: number;

  @Column('int', { nullable: true })
  barthelTotal?: number;

  // ===== NUEVOS CAMPOS (alineados al front) =====
  // Screening Postural (URL de imágenes)
  @Column('text', { nullable: true })
  vistaAnteriorUrl?: string;

  @Column('text', { nullable: true })
  vistaPosteriorUrl?: string;

  @Column('text', { nullable: true })
  vistaLateralDerechaUrl?: string;

  @Column('text', { nullable: true })
  vistaLateralIzquierdaUrl?: string;
  // Observaciones Screening Postural (texto)

  @Column('text', { nullable: true })
  observacionesVistaAnterior?: string;

  @Column('text', { nullable: true })
  observacionesVistaPosterior?: string;

  @Column('text', { nullable: true })
  observacionesVistaLateralDerecha?: string;

  @Column('text', { nullable: true })
  observacionesVistaLateralIzquierda?: string;

  // CIF (array de códigos) - en Postgres usa text[]
  @Column('jsonb', { nullable: true })
  cif?: { codigo: string; descripcion: string }[];

  // Diagnóstico y plan fisioterapéutico
  @Column('text', { nullable: true })
  diagnosticoFisioterapeutico?: string;

  @Column('text', { nullable: true })
  planFisioterapeutico?: string;

  // ===============================================

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
