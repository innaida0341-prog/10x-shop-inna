import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { profileSchema } from '@/utils/validation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shop_profile') || 'null') ||  {
        firstName: user?.username || '', lastName: '', email: '', phone: ''
      };
    } catch {
      return { firstName: user?.username || '', lastName: '', email: '', phone: '' };
    }
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <Formik
        initialValues={profile}
        enableReinitialize
        validationSchema={profileSchema}
        onSubmit={(values) => {
          setProfile(values);
          localStorage.setItem('shop_profile', JSON.stringify(values));
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      >
        {({ errors, touched }) => (
          <Form className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-4 space-y-3">
            <h2 className="font-semibold">Edit profile</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">First name</label>
                <Field
                  name="firstName"
                  className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 ${
                    touched.firstName && errors.firstName ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
                <ErrorMessage name="firstName" component="div" className="text-xs text-rose-500 mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last name</label>
                <Field
                  name="lastName"
                  className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 ${
                    touched.lastName && errors.lastName ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
                <ErrorMessage name="lastName" component="div" className="text-xs text-rose-500 mt-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Field
                name="email"
                type="email"
                className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 ${
                  touched.email && errors.email ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                }`}
              />
              <ErrorMessage name="email" component="div" className="text-xs text-rose-500 mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone (optional)</label>
              <Field
                name="phone"
                className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 ${
                  touched.phone && errors.phone ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                }`}
              />
              <ErrorMessage name="phone" component="div" className="text-xs text-rose-500 mt-1" />
            </div>
            <button className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700">Save changes</button>
            {saved && <p className="text-sm text-emerald-600">✓ Saved!</p>}
          </Form>
        )}
      </Formik>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="font-medium">Theme</div>
          <div className="text-sm text-gray-500">Currently: {theme}</div>
        </div>
        <button onClick={toggle} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700">
          {theme === 'dark' ? '☀ Light mode' : '🌙 Dark mode'}
        </button>
      </div>

      <button
        onClick={() => { logout(); navigate('/'); }}
        className="w-full mt-4 py-3 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-md hover:opacity-90"
      >
        Log out
      </button>
    </div>
  );
}
