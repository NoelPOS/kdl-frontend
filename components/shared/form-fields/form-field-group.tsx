import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldGroupProps {
  /** Label text shown above the field. */
  label: string;
  /** Marks the field as required — shows a red asterisk. */
  required?: boolean;
  /** Validation error message shown below the field in red. */
  error?: string;
  /** Hint text shown below the field when there is no error. */
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a label, input, and optional error/hint message in a consistent layout.
 *
 * Usage:
 * ```tsx
 * <FormFieldGroup label="Title" required error={errors.title?.message}>
 *   <Input {...register("title")} />
 * </FormFieldGroup>
 * ```
 */
export function FormFieldGroup({
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldGroupProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label className="text-sm text-gray-500">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
