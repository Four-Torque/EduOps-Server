import { ApiExtraModels, getSchemaPath, OpenAPIObject } from '@nestjs/swagger';

/**
 * parseBodySchema 함수는 주어진 모델 또는 예시 데이터를 기반으로 Swagger 문서화를 위한 스키마를 생성합니다.
 * @param modelOrExample - Swagger 문서화에 사용할 모델 클래스 또는 예시 데이터
 * @param isArray - 응답이 배열인지 여부 (기본값: false)
 * @param decorators - Swagger 데코레이터를 적용할 배열
 * @returns - Swagger 문서화를 위한 스키마 객체
 */
export function parseBodySchema(
  modelOrExample: any,
  isArray: boolean,
  decorators: any[],
): any {
  const isDto =
    typeof modelOrExample === 'function' &&
    ![String, Number, Boolean, Array, Object].includes(modelOrExample);

  if (isDto) {
    decorators.push(ApiExtraModels(modelOrExample));
    return isArray
      ? { type: 'array', items: { $ref: getSchemaPath(modelOrExample) } }
      : { $ref: getSchemaPath(modelOrExample) };
  }
  return parsePrimitiveOrExample(modelOrExample);
}

/**
 * parsePrimitiveOrExample 함수는 주어진 예시 데이터를 기반으로 Swagger 문서화를 위한 스키마를 생성합니다.
 * @param example - Swagger 문서화에 사용할 예시 데이터
 * @returns - Swagger 문서화를 위한 스키마 객체
 */
export function parsePrimitiveOrExample(example: any): any {
  const valueType = typeof example;

  if (Array.isArray(example)) {
    return {
      type: 'array',
      example,
      items: { type: example.length > 0 ? typeof example[0] : 'string' },
    };
  }

  if (valueType === 'object') {
    return { type: 'object', example };
  }

  return { type: valueType, example };
}

/**
 * createResponseProperties 함수는 Swagger 문서화를 위한 응답 속성을 생성합니다.
 * @param message - 응답 메시지
 * @param bodySchema - 응답 본문 스키마
 * @returns - Swagger 문서화를 위한 응답 속성 객체
 */
export function createResponseProperties(
  message?: string,
  bodySchema?: any,
): Record<string, any> {
  const properties: Record<string, any> = {
    statusCode: { type: 'number', example: 200 },
    method: { type: 'string', example: 'GET' },
    path: { type: 'string', example: '/api/[module]/[endpoint]' },
    message: { type: 'string', example: message || '성공' },
    timestamp: { type: 'string', example: '2026-06-29 11:45:00' },
  };

  if (bodySchema) {
    properties.body = bodySchema;
  }

  return properties;
}

/** * autoPatchSwaggerPaths 함수는 Swagger 문서의 경로 정보를 자동으로 패치하여 각 응답에 대한 예시 데이터를 업데이트합니다.
 * @param document - Swagger 문서 객체
 * @returns - 업데이트된 Swagger 문서 객체
 */
export function autoPatchSwaggerPaths(document: OpenAPIObject): OpenAPIObject {
  if (!document.paths) return document;

  Object.keys(document.paths).forEach((pathKey) => {
    const pathItem = document.paths[pathKey];

    Object.keys(pathItem).forEach((methodKey) => {
      const operation = pathItem[methodKey];
      if (!operation.responses) return;

      const currentMethod = methodKey.toUpperCase();

      Object.keys(operation.responses).forEach((statusCodeKey) => {
        const response = operation.responses[statusCodeKey];
        const jsonContent = response?.content?.['application/json'];
        if (!jsonContent) return;

        if (jsonContent.schema?.properties) {
          const properties = jsonContent.schema.properties;

          if (properties.statusCode) {
            const isPostSuccess =
              currentMethod === 'POST' && statusCodeKey === '201';
            properties.statusCode.example = isPostSuccess
              ? 201
              : Number(statusCodeKey);
          }

          if (properties.method) {
            properties.method.example = currentMethod;
          }

          if (properties.path) {
            properties.path.example = pathKey;
          }
        }

        if (jsonContent.examples) {
          const examples = jsonContent.examples;

          Object.keys(examples).forEach((exampleKey) => {
            const exampleInstance = examples[exampleKey];
            if (exampleInstance && exampleInstance.value) {
              if ('path' in exampleInstance.value) {
                exampleInstance.value.path = pathKey;
              }
              if ('statusCode' in exampleInstance.value) {
                exampleInstance.value.statusCode = Number(statusCodeKey);
              }
            }
          });
        }
      });
    });
  });

  return document;
}
