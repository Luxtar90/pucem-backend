import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(private readonly httpService: HttpService) {}

  async generateApiKey(): Promise<{ message: string; token: string }> {
    this.logger.log('Generating API key...');

    try {
      const postData = {
        grant_type: 'client_credentials',
        scope: 'contentapi',
      };

      // Credenciales
      const clientId = process.env.CLIENT_ID || 'nada-que-ver';
      const clientSecret = process.env.CLIENT_SECRET || 'nada-que-ver-v2';

      // Crear el string de autenticación base64
      const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );

      const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
      };

      const urlApiBody: string = process.env.URL_API_BODY || 'nada-que-ver-v3';

      const response = await firstValueFrom(
        this.httpService.post(urlApiBody, postData, { headers }),
      );

      const token = (response.data as { access_token: string }).access_token;

      if (!token) {
        throw new HttpException(
          'Failed to generate API key',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.log('API key generated successfully');

      return {
        message: 'API Key of BodyMap generated successfully',
        token: token,
      };
    } catch (error) {
      this.logger.error('Error generating API key:', error.message);
      throw new HttpException(
        'Failed to generate API key',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
