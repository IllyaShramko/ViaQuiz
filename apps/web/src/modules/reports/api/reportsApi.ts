import { baseApi } from '../../../shared/api/base-api';
import type {
	TeacherSessionsListDto,
	TeacherSessionReportDto,
	StudentResultReportDto,
} from '@viaquiz/shared-types';

export const reportsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTeacherSessions: builder.query<
			TeacherSessionsListDto,
			{ page?: number; pageSize?: number; search?: string; classUuid?: string; courseUuid?: string }
		>({
			query: ({ page = 1, pageSize = 10, search, classUuid, courseUuid } = {}) => ({
				url: '/reports/sessions',
				params: {
					page,
					pageSize,
					...(search ? { search } : {}),
					...(classUuid ? { classUuid } : {}),
					...(courseUuid ? { courseUuid } : {}),
				},
			}),
		}),
		getSessionReport: builder.query<TeacherSessionReportDto, string>({
			query: (roomUuid) => `/reports/sessions/${roomUuid}`,
		}),
		getParticipantReport: builder.query<StudentResultReportDto, { roomUuid: string; participantId: number }>({
			query: ({ roomUuid, participantId }) => `/reports/sessions/${roomUuid}/participants/${participantId}`,
		}),
	}),
	overrideExisting: false,
});

export const {
	useGetTeacherSessionsQuery,
	useGetSessionReportQuery,
	useGetParticipantReportQuery,
} = reportsApi;
