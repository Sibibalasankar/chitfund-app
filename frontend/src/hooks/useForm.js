import { useState } from 'react';

export const useForm = (initialState, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field immediately after change if it's been touched before
    if (touched[field]) {
      const fieldErrors = validate({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field when it loses focus
    const fieldErrors = validate({ [field]: values[field] });
    setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const validateForm = () => {
    const newErrors = validate(values);
    setErrors(newErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues
  };
};