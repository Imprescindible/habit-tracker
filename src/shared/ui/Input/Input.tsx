import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.scss'

// ── Text / Number Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  hint?:    string
}
export function Input({ label, error, hint, className, id, ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <input id={inputId} className={`${styles.input} ${error ? styles.hasError : ''} ${className ?? ''}`} {...rest} />
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}

// ── Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}
export function Textarea({ label, error, id, className, ...rest }: TextareaProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={fieldId}>{label}</label>}
      <textarea id={fieldId} className={`${styles.input} ${styles.textarea} ${error ? styles.hasError : ''} ${className ?? ''}`} {...rest} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}

// ── Select
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:    string
  error?:    string
  children:  ReactNode
}
export function Select({ label, error, id, children, className, ...rest }: SelectProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={fieldId}>{label}</label>}
      <select id={fieldId} className={`${styles.input} ${styles.select} ${error ? styles.hasError : ''} ${className ?? ''}`} {...rest}>
        {children}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
