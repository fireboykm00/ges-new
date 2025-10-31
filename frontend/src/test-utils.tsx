import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

type CustomRenderOptions = {
  route?: string;
} & Omit<RenderOptions, 'queries'>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  { route = '/', ...options }: CustomRenderOptions = {}
) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: AllTheProviders, ...options });
};

export * from '@testing-library/react';
export { customRender as render };

// Mock API responses
export const mockLoginSuccess = (token = 'test-token', user = { id: 1, username: 'testuser' }) => {
  return {
    data: {
      success: true,
      data: {
        token,
        user,
      },
    },
  };
};

export const mockLoginError = (status = 401, message = 'Invalid credentials') => {
  return {
    response: {
      status,
      data: {
        success: false,
        message,
      },
    },
  };
};
