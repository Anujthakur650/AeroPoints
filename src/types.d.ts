import { DateValue } from "@react-types/datepicker";
import { RangeValue } from "@react-types/shared";

// Augment the @heroui/react module with proper type definitions
declare module '@heroui/react' {
  export interface DateRangePickerProps {
    label?: string;
    value: RangeValue<DateValue>;
    onChange: (value: RangeValue<DateValue>) => void;
    minValue?: DateValue;
    className?: string;
  }

  export interface SelectItemProps {
    key: string;
    children: React.ReactNode;
  }

  export interface InputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus?: () => void;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    isRequired?: boolean;
    isDisabled?: boolean;
    maxLength?: number;
    className?: string;
    ref?: React.RefObject<HTMLInputElement>;
  }

  export interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg";
    color?: "primary" | "secondary" | "success" | "warning" | "danger" | "white";
    className?: string;
  }

  export const DateRangePicker: React.FC<DateRangePickerProps>;
  export const SelectItem: React.FC<SelectItemProps>;
  export const Input: React.FC<InputProps>;
  export const Spinner: React.FC<SpinnerProps>;
}

export interface FlexibleDateRange {
  start: DateValue;
  end: DateValue;
} 