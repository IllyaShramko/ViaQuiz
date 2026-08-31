import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../modules/auth/context';
import { getUserDashboardPath } from '../../modules/auth/utils/role';
import { NotFoundHeader, NotFoundContent } from '../../modules/not-found';
import styles from '../../modules/not-found/ui/NotFound.module.css';

export function NotFoundPage() {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const homePath = user ? getUserDashboardPath(user) : '/';

  return (
    <div className={styles['not-found-page']}>
      <NotFoundHeader homePath={homePath} />
      <NotFoundContent
        homePath={homePath}
        onNavigateHome={() => navigate(homePath)}
      />
    </div>
  );
}
