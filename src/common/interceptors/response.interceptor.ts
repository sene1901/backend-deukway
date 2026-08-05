import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        // Si le service a déjà défini success/message (ex: remove()),
        // on respecte son message mais on garde le format uniforme.
        if (
          result &&
          typeof result === 'object' &&
          'success' in result &&
          'message' in result &&
          !('data' in result)
        ) {
          const { success, message, ...rest } = result;
          return { success, message, data: rest.data ?? null };
        }

        return {
          success: true,
          message: 'Opération réussie',
          data: result,
        };
      }),
    );
  }
}