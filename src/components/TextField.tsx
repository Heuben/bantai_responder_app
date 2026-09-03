import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  trailing?: React.ReactNode;
}

export function TextField({ label, hint, error, trailing, id, className = '', ...rest }: TextFieldProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
          className={[
          'w-full min-h-[56px] rounded-xl border bg-surface px-4 text-base text-ink placeholder:text-muted/70',
          'transition-[border-color,box-shadow] duration-150 ease-out',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25',
          'disabled:bg-raised disabled:text-muted',
          error ? 'border-danger' : 'border-line',
          trailing ? 'pr-12' : '',
          className].
          join(' ')} />
        
        {trailing ?
        <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div> :
        null}
      </div>
      {error ?
      <p id={`${inputId}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p> :
      hint ?
      <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p> :
      null}
    </div>);

}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  counter?: boolean;
}

export function TextArea({ label, hint, counter, id, className = '', ...rest }: TextAreaProps) {
  const areaId = id ?? `area-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const value = typeof rest.value === 'string' ? rest.value : '';
  return (
    <div className="w-full">
      <label htmlFor={areaId} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <textarea
        id={areaId}
        {...rest}
        className={[
        'w-full rounded-xl border border-line bg-surface p-4 text-base leading-relaxed text-ink placeholder:text-muted/70',
        'disabled:bg-raised disabled:text-muted',
        'transition-[border-color,box-shadow] duration-150 ease-out',
        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25',
        className].
        join(' ')} />
      
      <div className="mt-1.5 flex items-start justify-between gap-3">
        {hint ? <p className="text-sm text-muted">{hint}</p> : <span />}
        {counter ? <span className="tabular text-sm text-muted">{value.length}</span> : null}
      </div>
    </div>);

}