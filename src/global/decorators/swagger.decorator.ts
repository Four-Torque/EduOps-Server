import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { createResponseProperties, parseBodySchema } from '../swagger/helper';
import { ErrorCode, ErrorCodeMap } from '../enums/error-code.enum';

/**
 * ApiSuccessResponse 데코레이터는 Swagger 문서화를 위한 성공적인 응답을 자동으로 생성합니다.
 * @param message - 성공적인 응답 메시지
 * @param modelOrExample - 성공적인 응답의 모델 또는 예시 데이터
 * @param isArray - 응답이 배열인지 여부 (기본값: false)
 * @returns - Swagger 문서화를 위한 데코레이터
 */
export function ApiSuccessResponse(
  message?: string,
  modelOrExample?: any,
  isArray: boolean = false,
) {
  const decorators = [];
  const hasBody = modelOrExample !== undefined && modelOrExample !== null;

  const bodySchema = hasBody
    ? parseBodySchema(modelOrExample, isArray, decorators)
    : null;

  const responseProperties = createResponseProperties(message, bodySchema);

  decorators.push(
    ApiOkResponse({
      description: '성공적인 응답',
      schema: {
        type: 'object',
        properties: responseProperties,
      },
    }),
  );

  return applyDecorators(...decorators);
}

/**
 * ApiErrorResponse 데코레이터는 주어진 에러 코드에 대한 Swagger 문서화를 자동으로 생성합니다.
 * @param errorCodes - Swagger 문서화에 포함할 에러 코드 배열
 * @returns - Swagger 문서화를 위한 데코레이터
 */
export function ApiErrorResponse(...errorCodes: ErrorCode[]) {
  const statusGroupedExamples: Record<number, Record<string, any>> = {};

  errorCodes.forEach((code) => {
    const errorMeta = ErrorCodeMap[code];
    if (!errorMeta) return;

    const { status, message } = errorMeta;

    if (!statusGroupedExamples[status]) {
      statusGroupedExamples[status] = {};
    }

    statusGroupedExamples[status][code] = {
      summary: message,
      value: {
        statusCode: status,
        code,
        path: '/api/[module]/[endpoint]',
        message: message,
        timestamp: '2026-06-29 12:17:13',
      },
    };
  });

  const decorators = Object.keys(statusGroupedExamples).map((statusStr) => {
    const status = Number(statusStr);
    return ApiResponse({
      status,
      description: `${status} 에러 상황`,
      content: {
        'application/json': {
          examples: statusGroupedExamples[status],
        },
      },
    });
  });

  return applyDecorators(...decorators);
}
