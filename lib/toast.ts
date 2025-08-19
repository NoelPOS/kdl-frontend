import { toast } from "sonner";

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, description ? { description } : undefined);
  },

  error: (message: string, description?: string) => {
    toast.error(message, description ? { description } : undefined);
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, description ? { description } : undefined);
  },

  info: (message: string, description?: string) => {
    toast.info(message, description ? { description } : undefined);
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, { loading, success, error });
  },
};
