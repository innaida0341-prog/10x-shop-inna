
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { ProfileFormValues } from '@/types/user';
import { profileSchema } from '@/utils/validation';

const getInitialProfile = (username: string): ProfileFormValues => {
  const fallback: ProfileFormValues = {
    firstName: username,
    lastName: '',
    email: '',
    phone: '',
  };

  try {
    const saved = localStorage.getItem('shop_profile');

    if (!saved) return fallback;

    return {
      ...fallback,
      ...JSON.parse(saved),
    };
  } catch {
    return fallback;
  }
};

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [profile, setProfile] = useState<ProfileFormValues>(() =>
    getInitialProfile(user.username),
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Formik
        initialValues={profile}
        enableReinitialize
        validationSchema={profileSchema}
        onSubmit={(values) => {
          try {
            localStorage.setItem('shop_profile', JSON.stringify(values));

            updateProfile(values);
            setProfile(values);
            setSaveError('');
            setSaved(true);

            window.setTimeout(() => setSaved(false), 2000);
          } catch {
            setSaved(false);
            setSaveError('Could not save profile. Please try again.');
          }
        }}
      >
        {({ errors, touched }) => (
          <Form className="card space-y-4 p-5">
            <h2 className="font-semibold">Edit profile</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm font-medium"
                >
                  First name
                </label>
                <Field
                  id="firstName"
                  name="firstName"
                  className={`input-field ${
                    touched.firstName && errors.firstName
                      ? 'border-rose-500'
                      : ''
                  }`}
                />
                <ErrorMessage
                  name="firstName"
                  component="div"
                  className="mt-1 text-xs text-rose-500"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm font-medium"
                >
                  Last name
                </label>
                <Field
                  id="lastName"
                  name="lastName"
                  className={`input-field ${
                    touched.lastName && errors.lastName
                      ? 'border-rose-500'
                      : ''
                  }`}
                />
                <ErrorMessage
                  name="lastName"
                  component="div"
                  className="mt-1 text-xs text-rose-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium"
              >
                Email
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                className={`input-field ${
                  touched.email && errors.email ? 'border-rose-500' : ''
                }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="mt-1 text-xs text-rose-500"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium"
              >
                Phone (optional)
              </label>
              <Field
                id="phone"
                name="phone"
                className={`input-field ${
                  touched.phone && errors.phone ? 'border-rose-500' : ''
                }`}
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="mt-1 text-xs text-rose-500"
              />
            </div>

            <button type="submit" className="btn-primary min-h-11">
              Save changes
            </button>

            {saved && (
              <p role="status" className="text-sm text-emerald-600">
                ✓ Profile saved successfully!
              </p>
            )}

            {saveError && (
              <p role="alert" className="text-sm text-rose-500">
                {saveError}
              </p>
            )}
          </Form>
        )}
      </Formik>

      <section className="card flex items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-medium">Theme</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Currently: {theme}
          </p>
        </div>

        <button
          type="button"
          onClick={toggle}
          className="btn-secondary min-h-11"
        >
          {theme === 'dark' ? '☀ Light mode' : '🌙 Dark mode'}
        </button>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="min-h-11 w-full rounded-md bg-gray-900 py-3 text-white hover:opacity-90 dark:bg-gray-700"
      >
        Log out
      </button>
    </div>
  );
}
