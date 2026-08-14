import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { router } from './router';
import { store } from './store';
import { UserContextProvider } from '../modules/auth/context';
import { LocaleProvider } from '../shared/i18n';

export function App() {
  return (
    <Provider store={store}>
      <LocaleProvider>
        <UserContextProvider>
          <RouterProvider router={router} />
        </UserContextProvider>
      </LocaleProvider>
    </Provider>
  );
}

