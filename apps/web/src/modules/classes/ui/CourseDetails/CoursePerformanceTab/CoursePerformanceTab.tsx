import { useGetCoursePerformanceQuery } from '../../../api/classesApi';
import {
  PerformanceOverview,
  usePerformancePeriodFilter,
} from '../../PerformanceOverview';
import type { CoursePerformanceTabProps } from './CoursePerformanceTab.types';

export function CoursePerformanceTab({
  classUuid,
  courseUuid,
}: CoursePerformanceTabProps) {
  const periodFilter = usePerformancePeriodFilter();

  const { data, isLoading, isFetching, isError } = useGetCoursePerformanceQuery(
    {
      classUuid,
      courseUuid,
      from: periodFilter.appliedRange.from,
      to: periodFilter.appliedRange.to,
    },
    { skip: !classUuid || !courseUuid },
  );

  return (
    <PerformanceOverview
      classUuid={classUuid}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      emptyStudentsText="На цьому курсі ще немає зарахованих учнів."
      {...periodFilter}
    />
  );
}
