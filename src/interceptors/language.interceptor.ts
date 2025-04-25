import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export default class LanguageInterceptor {
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
      response.data.map(
        (ele: { name?: string; nameEn?: string; nameAr?: string }) => {
          ele.name = ele.nameEn;
          delete ele.nameAr;
          delete ele.nameEn;
        },
      );
    } else {
      for (const key in response.data) {
        const ele = response.data[key] as Record<string, any> & {
          name?: string;
          nameEn?: string;
          nameAr?: string;
        };
        if ('nameEn' in ele) {
          ele.name = ele.nameEn;
          delete ele.nameAr;
          delete ele.nameEn;
        }
      }
    }

    return response;
  }

  private filterResponseForArabic(
    response: Record<string, any>,
  ): Record<string, any> {
    if (!response?.data) return response;

    if (Array.isArray(response.data)) {
      response.data.map(
        (ele: { name?: string; nameEn?: string; nameAr?: string }) => {
          ele.name = ele.nameAr;
          delete ele.nameAr;
          delete ele.nameEn;
        },
      );
    } else {
      for (const key in response.data) {
        const ele = response.data[key] as Record<string, any> & {
          name?: string;
          nameEn?: string;
          nameAr?: string;
        };
        if ('nameAr' in ele) {
          ele.name = ele.nameAr;
          delete ele.nameAr;
          delete ele.nameEn;
        }
      }
    }

    return response;
  }
}
