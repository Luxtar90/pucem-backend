import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNeurologicaDto } from '@/neurologica/dto/create-neurologica.dto';
import { UpdateNeurologicaDto } from '@/neurologica/dto/update-neurologica.dto';
import { Neurologica } from '@/neurologica/entities/neurologica.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { handleDBExceptions } from '@/common/utils';

type ScreeningImages = {
  vistaAnteriorUrl?: string;
  vistaPosteriorUrl?: string;
  vistaLateralDerechaUrl?: string;
  vistaLateralIzquierdaUrl?: string;
};

@Injectable()
export class NeurologicaService {
  private readonly logger = new Logger(NeurologicaService.name);

  constructor(
    @InjectRepository(Neurologica)
    private readonly neurologicaRepository: Repository<Neurologica>,
  ) {}

  // ================= Helpers =================

  private calcBarthelTotal(
    b?: Partial<{
      vestirse: number;
      arreglarse: number;
      deposicion: number;
      miccion: number;
      usoRetrete: number;
      trasladarse: number;
      deambular: number;
      escaleras: number;
    }>,
  ) {
    if (!b) return null;
    const keys = [
      'vestirse',
      'arreglarse',
      'deposicion',
      'miccion',
      'usoRetrete',
      'trasladarse',
      'deambular',
      'escaleras',
    ] as const;

    let total = 0;
    for (const k of keys) {
      const n = Number(b[k] ?? 0);
      total += Number.isFinite(n) ? n : 0;
    }
    return Number.isNaN(total) ? null : total;
  }

  private applyImages(target: Neurologica, images?: ScreeningImages) {
    if (!images) return;
    if (typeof images.vistaAnteriorUrl !== 'undefined') {
      target.vistaAnteriorUrl = images.vistaAnteriorUrl ?? null;
    }
    if (typeof images.vistaPosteriorUrl !== 'undefined') {
      target.vistaPosteriorUrl = images.vistaPosteriorUrl ?? null;
    }
    if (typeof images.vistaLateralDerechaUrl !== 'undefined') {
      target.vistaLateralDerechaUrl = images.vistaLateralDerechaUrl ?? null;
    }
    if (typeof images.vistaLateralIzquierdaUrl !== 'undefined') {
      target.vistaLateralIzquierdaUrl = images.vistaLateralIzquierdaUrl ?? null;
    }
  }

  // ================= CRUD =================

  // acepta opcionalmente las URLs de imágenes
  async create(
    createNeurologicaDto: CreateNeurologicaDto,
    images?: ScreeningImages,
  ) {
    try {
      const {
        alteracionesMarcha,
        riesgoCaida,
        barthel,
        bodyMap,
        dolorRegistros,
        ...neurologicaData
      } = createNeurologicaDto;

      this.logger.log('Creando PENE...');

      // Alteraciones de la marcha
      const marchaData = alteracionesMarcha
        ? {
            marchaTrendelenburg: !!alteracionesMarcha.marchaTrendelenburg,
            marchaTuerca: !!alteracionesMarcha.marchaTuerca,
            marchaAtaxica: !!alteracionesMarcha.marchaAtaxica,
            marchaSegador: !!alteracionesMarcha.marchaSegador,
            marchaTijeras: !!alteracionesMarcha.marchaTijeras,
            marchaTabetica: !!alteracionesMarcha.marchaTabetica,
            marchaCoreica: !!alteracionesMarcha.marchaCoreica,
            marchaDistonica: !!alteracionesMarcha.marchaDistonica,
            otrasAlteraciones: alteracionesMarcha.otrasAlteraciones ?? null,
          }
        : {};

      // Riesgo de caída
      const riesgoData = riesgoCaida
        ? {
            tiempoTimedUpGo: riesgoCaida.tiempoTimedUpGo ?? null,
            riesgoEvaluado: riesgoCaida.riesgoEvaluado ?? null,
            comentariosRiesgo: riesgoCaida.comentariosRiesgo ?? null,
          }
        : {};

      // Barthel
      const barthelData = barthel
        ? {
            barthelVestirse: barthel.vestirse ?? null,
            barthelArreglarse: barthel.arreglarse ?? null,
            barthelDeposicion: barthel.deposicion ?? null,
            barthelMiccion: barthel.miccion ?? null,
            barthelUsoRetrete: barthel.usoRetrete ?? null,
            barthelTrasladarse: barthel.trasladarse ?? null,
            barthelDeambular: barthel.deambular ?? null,
            barthelEscaleras: barthel.escaleras ?? null,
          }
        : {};
      const barthelTotal = this.calcBarthelTotal(barthel);

      // Extras directos
      const extras = {
        cif: Array.isArray(neurologicaData.cif) ? neurologicaData.cif : null,
        observacionesVistaAnterior:
          neurologicaData.observacionesVistaAnterior ?? null,
        observacionesVistaPosterior:
          neurologicaData.observacionesVistaPosterior ?? null,
        observacionesVistaLateralDerecha:
          neurologicaData.observacionesVistaLateralDerecha ?? null,
        observacionesVistaLateralIzquierda:
          neurologicaData.observacionesVistaLateralIzquierda ?? null,
        diagnosticoFisioterapeutico:
          neurologicaData.diagnosticoFisioterapeutico?.trim?.() || null,
        planFisioterapeutico:
          neurologicaData.planFisioterapeutico?.trim?.() || null,
      };

      const bodyMapData =
        bodyMap && typeof bodyMap === 'object' ? bodyMap : null;

      const dolorRegistrosData =
        dolorRegistros && Array.isArray(dolorRegistros)
          ? dolorRegistros.map((registro) => ({
              region: registro.region,
              tiempo: registro.tiempo,
              irradiado: registro.irradiado,
              tipo: registro.tipo,
              evn: registro.evn,
              subjetiva: registro.subjetiva,
              alivian: registro.alivian || [],
              agravan: registro.agravan || [],
              comentarios: registro.comentarios || null,
            }))
          : null;

      const neurologica = this.neurologicaRepository.create({
        ...neurologicaData, // name, ci, edad, diagnostico, discapacidad, etc.
        ...marchaData,
        ...riesgoData,
        ...barthelData,
        ...extras,
        bodyMap: bodyMapData,
        dolorRegistros: dolorRegistrosData,
        barthelTotal,
      });

      // merge de imágenes si vienen
      this.applyImages(neurologica, images);

      await this.neurologicaRepository.save(neurologica);
      return {
        message: 'Evaluación neurológica creada exitosamente',
        neurologica,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;

    const [neurologicas, total] = await this.neurologicaRepository.findAndCount(
      {
        take: limit,
        skip: offset,
        order: { createdAt: 'DESC' },
      },
    );

    return {
      neurologicas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const neurologica = await this.neurologicaRepository.findOne({
      where: { id },
    });
    if (!neurologica) {
      throw new NotFoundException(
        `Evaluación neurológica con ID ${id} no encontrada`,
      );
    }
    return neurologica;
  }

  // admite opcionalmente actualizar imágenes
  async update(
    id: string,
    updateNeurologicaDto: UpdateNeurologicaDto,
    images?: ScreeningImages,
  ) {
    try {
      const {
        alteracionesMarcha,
        riesgoCaida,
        barthel,
        bodyMap,
        dolorRegistros,
        ...neurologicaData
      } = updateNeurologicaDto;

      const neurologica = await this.findOne(id);

      // Alteraciones de la marcha
      if (alteracionesMarcha) {
        Object.assign(neurologica, {
          marchaTrendelenburg:
            alteracionesMarcha.marchaTrendelenburg ??
            neurologica.marchaTrendelenburg,
          marchaTuerca:
            alteracionesMarcha.marchaTuerca ?? neurologica.marchaTuerca,
          marchaAtaxica:
            alteracionesMarcha.marchaAtaxica ?? neurologica.marchaAtaxica,
          marchaSegador:
            alteracionesMarcha.marchaSegador ?? neurologica.marchaSegador,
          marchaTijeras:
            alteracionesMarcha.marchaTijeras ?? neurologica.marchaTijeras,
          marchaTabetica:
            alteracionesMarcha.marchaTabetica ?? neurologica.marchaTabetica,
          marchaCoreica:
            alteracionesMarcha.marchaCoreica ?? neurologica.marchaCoreica,
          marchaDistonica:
            alteracionesMarcha.marchaDistonica ?? neurologica.marchaDistonica,
          otrasAlteraciones:
            alteracionesMarcha.otrasAlteraciones ??
            neurologica.otrasAlteraciones,
        });
      }

      // Riesgo de caída
      if (riesgoCaida) {
        Object.assign(neurologica, {
          tiempoTimedUpGo:
            riesgoCaida.tiempoTimedUpGo ?? neurologica.tiempoTimedUpGo,
          riesgoEvaluado:
            riesgoCaida.riesgoEvaluado ?? neurologica.riesgoEvaluado,
          comentariosRiesgo:
            riesgoCaida.comentariosRiesgo ?? neurologica.comentariosRiesgo,
        });
      }

      // Barthel
      if (barthel) {
        Object.assign(neurologica, {
          barthelVestirse: barthel.vestirse ?? neurologica.barthelVestirse,
          barthelArreglarse:
            barthel.arreglarse ?? neurologica.barthelArreglarse,
          barthelDeposicion:
            barthel.deposicion ?? neurologica.barthelDeposicion,
          barthelMiccion: barthel.miccion ?? neurologica.barthelMiccion,
          barthelUsoRetrete:
            barthel.usoRetrete ?? neurologica.barthelUsoRetrete,
          barthelTrasladarse:
            barthel.trasladarse ?? neurologica.barthelTrasladarse,
          barthelDeambular: barthel.deambular ?? neurologica.barthelDeambular,
          barthelEscaleras: barthel.escaleras ?? neurologica.barthelEscaleras,
        });
        const total = this.calcBarthelTotal(barthel);
        if (total !== null) neurologica.barthelTotal = total;
      }

      // Campos directos
      if ('cif' in neurologicaData)
        neurologica.cif = Array.isArray(neurologicaData.cif)
          ? neurologicaData.cif
          : null;

      if ('observacionesVistaAnterior' in neurologicaData)
        neurologica.observacionesVistaAnterior =
          neurologicaData.observacionesVistaAnterior ??
          neurologica.observacionesVistaAnterior;

      if ('observacionesVistaPosterior' in neurologicaData)
        neurologica.observacionesVistaPosterior =
          neurologicaData.observacionesVistaPosterior ??
          neurologica.observacionesVistaPosterior;

      if ('observacionesVistaLateralDerecha' in neurologicaData)
        neurologica.observacionesVistaLateralDerecha =
          neurologicaData.observacionesVistaLateralDerecha ??
          neurologica.observacionesVistaLateralDerecha;

      if ('observacionesVistaLateralIzquierda' in neurologicaData)
        neurologica.observacionesVistaLateralIzquierda =
          neurologicaData.observacionesVistaLateralIzquierda ??
          neurologica.observacionesVistaLateralIzquierda;

      if ('diagnosticoFisioterapeutico' in neurologicaData)
        neurologica.diagnosticoFisioterapeutico =
          neurologicaData.diagnosticoFisioterapeutico?.trim?.() ||
          neurologica.diagnosticoFisioterapeutico ||
          null;

      if ('planFisioterapeutico' in neurologicaData)
        neurologica.planFisioterapeutico =
          neurologicaData.planFisioterapeutico?.trim?.() ||
          neurologica.planFisioterapeutico ||
          null;

      if (bodyMap !== undefined) {
        neurologica.bodyMap =
          bodyMap && typeof bodyMap === 'object' ? bodyMap : null;
      }

      if (dolorRegistros !== undefined) {
        neurologica.dolorRegistros =
          dolorRegistros && Array.isArray(dolorRegistros)
            ? dolorRegistros.map((registro) => ({
                region: registro.region,
                tiempo: registro.tiempo,
                irradiado: registro.irradiado,
                tipo: registro.tipo,
                evn: registro.evn,
                subjetiva: registro.subjetiva,
                alivian: registro.alivian || [],
                agravan: registro.agravan || [],
                comentarios: registro.comentarios || null,
              }))
            : null;
      }

      // Resto de campos simples (si vienen)
      Object.entries(neurologicaData).forEach(([k, v]) => {
        if (
          ![
            'cif',
            'bodyMap',
            'dolorRegistros',
            'observacionesVistaAnterior',
            'observacionesVistaPosterior',
            'observacionesVistaLateralDerecha',
            'observacionesVistaLateralIzquierda',
            'diagnosticoFisioterapeutico',
            'planFisioterapeutico',
          ].includes(k)
        ) {
          if (typeof v !== 'undefined') {
            (neurologica as any)[k] = v;
          }
        }
      });

      // merge de imágenes si vienen en esta actualización
      this.applyImages(neurologica, images);

      await this.neurologicaRepository.save(neurologica);
      return {
        message: 'Evaluación neurológica actualizada exitosamente',
        neurologica,
      };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async remove(id: string) {
    const neurologica = await this.findOne(id);
    await this.neurologicaRepository.remove(neurologica);
    return { message: 'Evaluación neurológica eliminada exitosamente' };
  }

  async findByCI(ci: string) {
    const neurologicas = await this.neurologicaRepository.find({
      where: { ci },
      order: { createdAt: 'DESC' },
    });
    return neurologicas;
  }
}
