import { Formik, Form, Field, ErrorMessage } from 'formik';
import type { Product, Review } from '@/types/product';
import { useAuth } from '@/context/AuthContext';
import { reviewSchema } from '@/utils/validation';
import { formatDate } from '@/utils/format';

export function getLocalReviews(productId: number): Review[] {
  try {
    const all = JSON.parse(localStorage.getItem('shop_reviews') || '{}');
    return all[productId] || [];
  } catch {
    return [];
  }
}

function saveReview(productId: number, review: Review) {
  try {
    const all = JSON.parse(localStorage.getItem('shop_reviews') || '{}');
    all[productId] = [review, ...(all[productId] || [])];
    localStorage.setItem('shop_reviews', JSON.stringify(all));
  } catch {
    /* ignore storage errors */
  }
}

export function ReviewsSection({ product, onAdded }: { product: Product; onAdded: (r: Review) => void }) {
  const { user } = useAuth();
  const local = getLocalReviews(product.id);
  const all = [...local, ...(product.reviews || [])];

  return (
    <div>
      <Formik
        initialValues={{ rating: 0, comment: '' }}
        validationSchema={reviewSchema}
        onSubmit={(values, { resetForm }) => {
          const review: Review = {
            rating: values.rating,
            comment: values.comment.trim(),
            date: new Date().toISOString(),
            reviewerName: user?.username || 'Guest'
          };
          saveReview(product.id, review);
          onAdded(review);
          resetForm();
        }}
      >
        {({ setFieldValue, values, errors, touched }) => (
          <Form className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
            <h3 className="font-medium">Write a review</h3>
            <div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setFieldValue('rating', n)}
                    className={`text-2xl ${values.rating >= n ? 'text-amber-500' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {touched.rating && errors.rating && (
                <div className="text-xs text-rose-500 mt-1">{errors.rating}</div>
              )}
            </div>
            <div>
              <Field
                as="textarea"
                name="comment"
                rows={3}
                placeholder="Your comment (min 10 characters)…"
                className={`w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-800 ${
                  touched.comment && errors.comment ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                }`}
              />
              <ErrorMessage name="comment" component="div" className="text-xs text-rose-500 mt-1" />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
              Submit review
            </button>
          </Form>
        )}
      </Formik>

      <div className="space-y-3 mt-4">
        {all.length === 0 && <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first!</p>}
        {all.map((r, i) => (
          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 text-sm mb-1">
              <span className="font-medium">{r.reviewerName}</span>
              <span className="text-amber-500">
                {'★'.repeat(r.rating)}
                {'☆'.repeat(5 - r.rating)}
              </span>
              <span className="text-gray-400 text-xs">{formatDate(r.date)}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}