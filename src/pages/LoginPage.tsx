import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@/utils/validation';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  return (
    <div className="max-w-md mx-auto mt-8">
      <Link to="/" className="text-sm text-brand-600 hover:underline">← Back to catalog</Link>
      <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Log in</h1>
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              login(values.username);
              setSubmitting(false);
              navigate(from, { replace: true });
            }, 400);
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Field
                  name="username"
                  className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 ${
                    touched.username && errors.username ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
                <ErrorMessage name="username" component="div" className="text-xs text-rose-500 mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Field
                  name="password"
                  type="password"
                  className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 ${
                    touched.password && errors.password ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
                <ErrorMessage name="password" component="div" className="text-xs text-rose-500 mt-1" />
              </div>
              <button
                disabled={isSubmitting}
                className="w-full py-2.5 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Logging in…' : 'Log In'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}