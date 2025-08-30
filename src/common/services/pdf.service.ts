import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  private readonly logger = new Logger('PdfService');

  async generatePdf(data: any[], title: string): Promise<Buffer> {
    try {
      this.logger.log(`Iniciando generación de PDF para: ${title}`);
      this.logger.debug(`Datos recibidos: ${data?.length ?? 0} registros`);

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      const html = this.generateHtml(data ?? [], title);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error: any) {
      this.logger.error(`Error generando PDF: ${error?.message}`);
      this.logger.error(error?.stack);
      throw error;
    }
  }

  // ================== HTML builders ==================

  private generateHtml(data: any[], title: string): string {
    const sections = data.map((row, i) => {
      // Heurística simple para detectar una evaluación neurológica
      const isNeuro =
        'diagnosticoFisioterapeutico' in row ||
        'vistaAnteriorUrl' in row ||
        'barthelTotal' in row ||
        'alteracionesMarcha' in row ||
        'marchaTrendelenburg' in row;

      return isNeuro
        ? this.renderNeurologicaSection(row, i + 1)
        : this.renderGenericSection(row, i + 1);
    });

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            h1 { text-align: center; color: #333; margin: 0 0 16px 0; }
            h2 {
              margin: 18px 0 8px 0; color: #444; text-align: center;
              font-size: 18px; background-color: #eee; padding: 6px; border-radius: 6px;
            }
            h3 { margin: 10px 0 6px 0; color: #444; }
            section { margin-bottom: 18px; page-break-inside: avoid; }
            .kv { width: 100%; border-collapse: collapse; table-layout: fixed; }
            .kv th, .kv td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; vertical-align: top; word-wrap: break-word; }
            .kv th { width: 32%; background: #f7f7f7; text-align: left; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            figure { margin: 0; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
            figure img { display: block; width: 100%; height: 230px; object-fit: contain; background:#fafafa; }
            figure figcaption { font-size: 11px; padding: 6px 8px; background: #f2f2f2; border-top: 1px solid #e5e5e5; }
            .hr { border: 0; border-top: 1px solid #666; margin: 10px 0; }
            .pill { display:inline-block; padding:2px 8px; font-size:11px; border-radius: 999px; background:#f2f2f2; margin:2px 4px 0 0; }
            .table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            .table th, .table td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; }
            .table th { background:#333; color:#fff; }
            .muted { color:#666; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>${this.escape(title).toUpperCase()}</h1>
          ${sections.join('')}
        </body>
      </html>
    `;
  }

  private renderGenericSection(item: any, index: number): string {
    // Filtra llaves con "id" y transforma a tabla de 2 filas (headers / values) por lotes
    const filtered: Record<string, any> = {};
    for (const [k, v] of Object.entries(item)) {
      if (!k.toLowerCase().includes('id')) filtered[k.toUpperCase()] = v;
    }

    const headers = Object.keys(filtered);
    const values = Object.values(filtered);

    const columnsPerTable = 6;
    const tables: string[] = [];
    for (let i = 0; i < headers.length; i += columnsPerTable) {
      const h = headers.slice(i, i + columnsPerTable);
      const val = values.slice(i, i + columnsPerTable);
      tables.push(`
        <table class="table">
          <thead><tr>${h.map((x) => `<th>${this.escape(x)}</th>`).join('')}</tr></thead>
          <tbody><tr>${val.map((v) => `<td>${this.pretty(v)}</td>`).join('')}</tr></tbody>
        </table>
      `);
    }

    return `
      <section>
        <h2>CONSULTA #${index}</h2>
        ${tables.join('')}
        <hr class="hr" />
      </section>
    `;
  }

  // ---------- NEUROLÓGICA ----------
  private renderNeurologicaSection(row: any, index: number): string {
    const yesNo = (b?: any) => (b ? 'SI' : 'NO');
    const pills = (arr?: any[]) =>
      Array.isArray(arr) && arr.length
        ? arr
            .map((x) => `<span class="pill">${this.escape(String(x))}</span>`)
            .join(' ')
        : '<span class="muted">—</span>';

    const kv = (label: string, value: any) => `
      <tr>
        <th>${this.escape(label)}</th>
        <td>${this.pretty(value)}</td>
      </tr>`;

    const kvBool = (label: string, value: any) => kv(label, yesNo(value));

    // Datos personales
    const datosPersonales = `
      <table class="kv">
        ${kv('Nombre', row.name)}
        ${kv('Cédula', row.ci)}
        ${kv('Edad', row.edad)}
        ${kv('Discapacidad', row.discapacidad)}
        ${kv('Diagnóstico Médico', row.diagnostico)}
      </table>
    `;

    // Antecedentes e info adicional
    const antecedentes = `
      <table class="kv">
        ${kv('Antecedentes Heredofamiliares', row.antecedentesHeredofamiliares)}
        ${kv('Antecedentes Farmacológicos', row.antecedentesFarmacologicos)}
        ${kv('Historia Nutricional', row.historiaNutricional)}
        ${kv('Alergias', row.alergias)}
        ${kv('Hábitos Tóxicos', row.habitosToxicos)}
        ${kv('Quirúrgico', row.quirurgico)}
        ${kv('Comunicación', row.comunicacion)}
        ${kv('Dolor', row.dolor)}
        ${kvBool('Utiliza silla de ruedas', row.utilizaSillaRuedas)}
      </table>
    `;

    // Amnesis
    const amnesis = `
      <table class="kv">
        ${kv('Amnesis', row.amnesis)}
        ${kv('Inicio y evolución del cuadro', row.inicioEvolucion)}
        ${kv('Entorno familiar y social', row.entornoFamiliar)}
      </table>
    `;

    // Alteraciones de la marcha
    const alteraciones = `
      <table class="kv">
        ${kvBool('Marcha de Trendelenburg', row.marchaTrendelenburg)}
        ${kvBool('Marcha en tuerca', row.marchaTuerca)}
        ${kvBool('Marcha atáxica', row.marchaAtaxica)}
        ${kvBool('Marcha en segador', row.marchaSegador)}
        ${kvBool('Marcha en tijeras', row.marchaTijeras)}
        ${kvBool('Marcha tabética', row.marchaTabetica)}
        ${kvBool('Marcha coreica', row.marchaCoreica)}
        ${kvBool('Marcha distónica', row.marchaDistonica)}
        ${kv('Otras alteraciones', row.otrasAlteraciones)}
      </table>
    `;

    // Riesgo de caída
    const riesgo = `
      <table class="kv">
        ${kv('Tiempo Timed Up and Go', row.tiempoTimedUpGo)}
        ${kv('Riesgo evaluado', row.riesgoEvaluado)}
        ${kv('Comentarios', row.comentariosRiesgo)}
      </table>
    `;

    // Alcance motor
    const alcance = `
      <table class="kv">
        ${kv('Alcance motor más alto', row.alcanceMotor)}
      </table>
    `;

    // Barthel
    const barthel = `
      <table class="kv">
        ${kv('Vestirse', row.barthelVestirse)}
        ${kv('Arreglarse', row.barthelArreglarse)}
        ${kv('Deposición', row.barthelDeposicion)}
        ${kv('Micción', row.barthelMiccion)}
        ${kv('Uso del retrete', row.barthelUsoRetrete)}
        ${kv('Trasladarse', row.barthelTrasladarse)}
        ${kv('Deambular', row.barthelDeambular)}
        ${kv('Escaleras', row.barthelEscaleras)}
        ${kv('Total Barthel', row.barthelTotal)}
      </table>
    `;

    // CIF (array)
    const cif = `
  <div>
    <h3>XIV. CIF (Estructuras Anatómicas)</h3>
    ${
      Array.isArray(row.cif) && row.cif.length
        ? row.cif
            .map(
              (c: any) =>
                `<span class="pill">${this.escape(c.codigo)} — ${this.escape(c.descripcion)}</span>`,
            )
            .join(' ')
        : '<span class="muted">Sin registros</span>'
    }
  </div>
`;

    // Comentarios y resumen
    const comentariosResumen = `
      <table class="kv">
        ${kv('Comentarios del examinador', row.comentariosExaminador)}
        ${kv('Resumen de resultados', row.resumenResultados)}
      </table>
    `;

    // Dx y Plan fisioterapéutico
    const dxPlan = `
      <table class="kv">
        ${kv('Diagnóstico fisioterapéutico', row.diagnosticoFisioterapeutico)}
        ${kv('Plan fisioterapéutico', row.planFisioterapeutico)}
      </table>
    `;

    // Screening postural (imágenes + observaciones)
    const imgs: Array<{ url?: string; caption: string; title: string }> = [
      {
        url: row.vistaAnteriorUrl,
        caption: row.observacionesVistaAnterior || 'Sin observaciones',
        title: 'Vista Anterior',
      },
      {
        url: row.vistaPosteriorUrl,
        caption: row.observacionesVistaPosterior || 'Sin observaciones',
        title: 'Vista Posterior',
      },
      {
        url: row.vistaLateralDerechaUrl,
        caption: row.observacionesVistaLateralDerecha || 'Sin observaciones',
        title: 'Vista Lateral Derecha',
      },
      {
        url: row.vistaLateralIzquierdaUrl,
        caption: row.observacionesVistaLateralIzquierda || 'Sin observaciones',
        title: 'Vista Lateral Izquierda',
      },
    ];

    const anyImg = imgs.some((x) => !!x.url);
    const screening = anyImg
      ? `
        <div>
          <h3>VII. Screening Postural</h3>
          <div class="grid-2">
            ${imgs
              .filter((x) => x.url)
              .map(
                (x) => `
                  <figure>
                    <img src="${this.escapeAttr(x.url!)}" alt="${this.escapeAttr(x.title)}" />
                    <figcaption><strong>${this.escape(x.title)}:</strong> ${this.escape(x.caption)}</figcaption>
                  </figure>
                `,
              )
              .join('')}
          </div>
        </div>
      `
      : `
        <div>
          <h3>VII. Screening Postural</h3>
          <div class="muted">Sin imágenes adjuntas</div>
        </div>
      `;

    // Sección completa
    return `
      <section>
        <h2>CONSULTA #${index} — EVALUACIÓN NEUROLÓGICA</h2>

        <h3>I. Datos personales</h3>
        ${datosPersonales}

        <h3>II. Antecedentes clínicos / III. Información médica adicional</h3>
        ${antecedentes}

        <h3>IV. Amnesis</h3>
        ${amnesis}

        ${screening}

        <h3>VIII. Alteraciones de la marcha</h3>
        ${alteraciones}

        <h3>IX. Riesgo de caída (Timed Up and Go)</h3>
        ${riesgo}

        <h3>X. Alcance motor más alto</h3>
        ${alcance}

        <h3>XI. Dependencia funcional — Índice de Barthel (AVD)</h3>
        ${barthel}

        ${cif}

        <h3>XII–XIII. Comentarios y resumen</h3>
        ${comentariosResumen}

        <h3>XV–XVI. Diagnóstico y plan fisioterapéutico</h3>
        ${dxPlan}

        <hr class="hr" />
      </section>
    `;
  }

  // ================== utils ==================

  private pretty(v: any): string {
    if (v === null || typeof v === 'undefined')
      return '<span class="muted">—</span>';
    if (Array.isArray(v)) {
      if (!v.length) return '<span class="muted">—</span>';
      return v.map((x) => this.escape(String(x))).join(', ');
    }
    if (typeof v === 'object') {
      try {
        return this.escape(JSON.stringify(v));
      } catch {
        return this.escape(String(v));
      }
    }
    const s = String(v);
    return s.trim() ? this.escape(s) : '<span class="muted">—</span>';
  }

  private escape(s: string): string {
    return s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  private escapeAttr(s: string): string {
    return this.escape(s).replaceAll('"', '&quot;');
  }
}
