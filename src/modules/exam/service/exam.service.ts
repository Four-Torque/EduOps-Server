import { Injectable } from '@nestjs/common';
import { ExamRepository } from '../repository/exam.repository';
import { ExamResultRepository } from '../repository/exam-result.repository';
import { CreateExamRequest } from '../request/create-exam.request';
import { UpdateExamRequest } from '../request/update-exam.request';
import { SaveExamResultRequest } from '../request/save-exam-result.request';
import { ExamResponse } from '../response/exam.response';
import { ExamResultResponse } from '../response/exam-result.response';
import { ApiException, ErrorCode } from 'src/global';
import { ClassRepository } from '../../class/repository/class.repository';

@Injectable()
export class ExamService {
  constructor(
    private readonly examRepository: ExamRepository,
    private readonly examResultRepository: ExamResultRepository,
    private readonly classRepository: ClassRepository,
  ) {}

  // --- Exam CRUD ---

  /**
   * createExam 메서드는 새로운 시험을 생성합니다.
   * @param request - 시험 생성을 위한 요청 객체
   * @returns Promise<ExamResponse> - 생성된 시험 객체를 반환합니다.
   * @throws ApiException - 강좌가 존재하지 않을 경우 CLASS_NOT_FOUND 에러 발생
   */
  async createExam(request: CreateExamRequest): Promise<ExamResponse> {
    const cls = await this.classRepository.findById(request.classId);
    if (!cls) {
      throw new ApiException(ErrorCode.CLASS_NOT_FOUND);
    }

    const entity = await this.examRepository.create(
      CreateExamRequest.toEntity(request),
    );
    return ExamResponse.fromEntity(entity);
  }

  /**
   * getExams 메서드는 전체 강좌 또는 특정 강좌의 시험 목록을 조회합니다.
   * @param teacherId - 조회할 강사의 ID (classId가 없을 경우 사용)
   * @param classId - 조회할 강좌의 ID (선택)
   * @param period - 조회할 기간 (1m, 3m, 6m, all)
   * @returns Promise<ExamResponse[]> - 시험 목록을 반환합니다.
   */
  async getExams(teacherId: string, classId?: string, period?: string): Promise<ExamResponse[]> {
    if (classId) {
      const cls = await this.classRepository.findById(classId);
      if (!cls) {
        throw new ApiException(ErrorCode.CLASS_NOT_FOUND);
      }
    }

    const exams = await this.examRepository.findAll(teacherId, classId, period);
    return exams.map((exam) => ExamResponse.fromEntity(exam));
  }

  /**
   * updateExam 메서드는 시험 정보를 수정합니다.
   * @param id - 수정할 시험의 ID
   * @param request - 수정을 위한 요청 객체
   * @returns Promise<ExamResponse> - 수정된 시험 객체를 반환합니다.
   * @throws ApiException - 시험이 존재하지 않을 경우 EXAM_NOT_FOUND 에러 발생
   */
  async updateExam(
    id: string,
    request: UpdateExamRequest,
  ): Promise<ExamResponse> {
    const existing = await this.examRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.EXAM_NOT_FOUND);
    }

    const updated = await this.examRepository.update(
      id,
      UpdateExamRequest.toEntity(request),
    );
    return ExamResponse.fromEntity(updated);
  }

  /**
   * deleteExam 메서드는 시험과 연결된 결과 데이터를 삭제합니다.
   * @param id - 삭제할 시험의 ID
   * @throws ApiException - 시험이 존재하지 않을 경우 EXAM_NOT_FOUND 에러 발생
   */
  async deleteExam(id: string): Promise<void> {
    const existing = await this.examRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.EXAM_NOT_FOUND);
    }

    // Repository 내부에서 연관된 ExamResult를 Cascade 삭제합니다.
    await this.examRepository.delete(id);
  }

  // --- Exam Result CRUD ---

  /**
   * saveExamResults 메서드는 한 명 또는 여러 명의 학생 시험 점수를 일괄 저장/수정(Upsert)합니다.
   * @param examId - 점수를 등록할 시험의 ID
   * @param request - 학생별 점수 배열을 포함하는 요청 객체
   * @throws ApiException - 시험이 존재하지 않을 경우 EXAM_NOT_FOUND 에러 발생
   */
  async saveExamResults(
    examId: string,
    request: SaveExamResultRequest,
  ): Promise<void> {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new ApiException(ErrorCode.EXAM_NOT_FOUND);
    }

    // 배열 형태의 점수를 반복문으로 upsert 처리
    // 성능을 위해 Promise.all 사용
    await Promise.all(
      request.results.map((result) =>
        this.examResultRepository.upsert(
          examId,
          result.studentId,
          result.score,
        ),
      ),
    );
  }

  /**
   * getExamResults 메서드는 특정 시험의 점수 결과 목록을 조회합니다.
   * @param examId - 조회할 시험의 ID
   * @returns Promise<ExamResultResponse[]> - 학생 이름이 포함된 시험 점수 목록을 반환합니다.
   * @throws ApiException - 시험이 존재하지 않을 경우 EXAM_NOT_FOUND 에러 발생
   */
  async getExamResults(examId: string): Promise<ExamResultResponse[]> {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new ApiException(ErrorCode.EXAM_NOT_FOUND);
    }

    const results = await this.examResultRepository.findByExamId(examId);
    return results.map((r) => ExamResultResponse.fromEntity(r));
  }

  /**
   * getExamStudentsResults 메서드는 반 전체 학생을 기준으로 점수 데이터를 매핑하여 반환합니다.
   * 점수가 없는 학생도 포함됩니다.
   */
  async getExamStudentsResults(examId: string): Promise<ExamResultResponse[]> {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new ApiException(ErrorCode.EXAM_NOT_FOUND);
    }

    const { enrollments, examResults } = await this.examResultRepository.findStudentsWithExamResults(examId, exam.classId);

    return enrollments.map(enrollment => {
      const result = examResults.find(r => r.studentId === enrollment.studentId);
      
      const response = new ExamResultResponse();
      response.id = result?.id;
      response.studentId = enrollment.studentId;
      response.studentName = enrollment.student.name;
      response.score = result?.score;

      return response;
    });
  }
}
