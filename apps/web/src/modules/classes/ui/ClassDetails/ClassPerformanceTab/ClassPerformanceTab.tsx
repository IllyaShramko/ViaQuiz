import { useGetClassroomPerformanceQuery } from '../../../api/classesApi';
import {
  PerformanceOverview,
  usePerformancePeriodFilter,
} from '../../PerformanceOverview';
import type { ClassPerformanceTabProps } from './ClassPerformanceTab.types';

export function ClassPerformanceTab({ classUuid }: ClassPerformanceTabProps) {
  const periodFilter = usePerformancePeriodFilter();

  const { data, isLoading, isFetching, isError } = useGetClassroomPerformanceQuery(
    {
      classUuid,
      from: periodFilter.appliedRange.from,
      to: periodFilter.appliedRange.to,
    },
    { skip: !classUuid },
  );

  return (
    <PerformanceOverview
      classUuid={classUuid}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      emptyStudentsText="У цьому класі ще немає учнів."
      {...periodFilter}
    />
  );
}
