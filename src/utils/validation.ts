import * as Yup from 'yup';

// Login (P1)
export const loginSchema = Yup.object({
  username: Yup.string().trim().required('Username is required'),
  password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
});

//checkout
export const checkoutSchema = Yup.object({
  fullName: Yup.string().trim().required('Full name is required').min(3, 'Full name must be at least 3 characters'),
  email: Yup.string().trim().required('Email is required').email('Please enter a valid email address'),
  address: Yup.string().trim().required('Address is required').min(5, 'Address must be at least 5 characters'),
  city: Yup.string().trim().required('City is required')
});


export const profileSchema = Yup.object({
  firstName: Yup.string().trim().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string().trim().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: Yup.string().trim().required('Email is required').email('Please enter a valid email address'),
  phone: Yup.string().trim().matches(/^[0-9+\s-]{0,18}$/, 'Please enter a valid phone number')
});


export const reviewSchema = Yup.object({
  rating: Yup.number().required('Please select a rating').min(1).max(5),
  comment: Yup.string().trim().required('Comment must be at least 10 characters').min(10, 'Comment must be at least 10 characters')
});