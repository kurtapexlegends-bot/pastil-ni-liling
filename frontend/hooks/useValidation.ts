import { useState, useCallback } from 'react';

export type ValidationRule<T> = (value: any, formState: T) => string | null;

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

export function useValidation<T extends Record<string, any>>(schema: ValidationSchema<T>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback((name: keyof T, value: any, formState: T): string | null => {
    const rules = schema[name];
    if (rules) {
      for (const rule of rules) {
        const error = rule(value, formState);
        if (error) {
          setErrors(prev => ({ ...prev, [name]: error }));
          return error;
        }
      }
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    return null;
  }, [schema]);

  const validateStep = useCallback((fields: (keyof T)[], formState: T): boolean => {
    let isValid = true;
    const stepErrors: Partial<Record<keyof T, string>> = {};
    
    fields.forEach(field => {
      const rules = schema[field];
      if (rules) {
        for (const rule of rules) {
          const error = rule(formState[field], formState);
          if (error) {
            stepErrors[field] = error;
            isValid = false;
            break;
          }
        }
      }
    });

    setErrors(prev => ({ ...prev, ...stepErrors }));
    return isValid;
  }, [schema]);

  const validateAll = useCallback((formState: T): boolean => {
    return validateStep(Object.keys(schema) as (keyof T)[], formState);
  }, [validateStep, schema]);

  return { errors, validateField, validateStep, validateAll, setErrors, clearErrors: () => setErrors({}) };
}

// Built-in constraint validators for easy global use
export const constraints = {
  required: (message = "This field is required") => (v: any) => 
    (v === null || v === undefined || (typeof v === 'string' && !v.trim())) ? message : null,
  minLength: (min: number, message?: string) => (v: string) => 
    (v && v.trim().length < min) ? (message || `Must be at least ${min} characters.`) : null,
  maxLength: (max: number, message?: string) => (v: string) => 
    (v && v.trim().length > max) ? (message || `Must not exceed ${max} characters.`) : null,
  pattern: (regex: RegExp, message: string) => (v: string) => 
    (v && !regex.test(v)) ? message : null,
  email: (message = "Enter a valid email address (e.g. name@domain.com).") => 
    constraints.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message),
  phonePH: (message = "Enter a valid 11-digit mobile number starting with 09.") => 
    (v: string) => {
      if (!v) return null;
      const cleaned = v.replace(/[\s-]/g, '');
      return (!/^09\d{9}$/.test(cleaned) && !/^\+639\d{9}$/.test(cleaned)) ? message : null;
    },
  minNum: (min: number, message?: string) => (v: number) =>
    (v !== null && v < min) ? (message || `Must be at least ${min}.`) : null
};