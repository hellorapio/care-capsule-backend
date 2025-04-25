import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export default class LanguageAdvancedInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    const lang = (request.query as Record<string, string>).lang || 'ar';

    return next.handle().pipe(
      map((response: Record<string, any>) => {
        return lang === 'en'
          ? this.filterResponseForEnglish(structuredClone(response))
          : this.filterResponseForArabic(structuredClone(response));
      }),
    );
  }

  private filterResponseForEnglish(
    response: Record<string, any>,
  ): Record<string, any> {
    if (!response?.data) return response;

    if (Array.isArray(response.data)) {
      response.data.map((ele: Record<string, any>) => {
        for (const key in ele) {
          const obj = ele[key] as Record<string, any> & {
            name?: string;
            nameEn?: string;
            nameAr?: string;
          };
          obj.name = obj.nameEn;
          delete obj.nameAr;
          delete obj.nameEn;
        }
      });
    }

    return response;
  }

  private filterResponseForArabic(
    response: Record<string, any>,
  ): Record<string, any> {
    if (!response?.data) return response;

    if (Array.isArray(response.data)) {
      response.data.map((ele: Record<string, any>) => {
        for (const key in ele) {
          const obj = ele[key] as Record<string, any> & {
            name?: string;
            nameEn?: string;
            nameAr?: string;
          };
          obj.name = obj.nameAr;
          delete obj.nameAr;
          delete obj.nameEn;
        }
      });
    }

    return response;
  }
}
