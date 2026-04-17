import Swal from 'sweetalert2';

// Configuración base para dark mode
const getSwalConfig = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#111827',
    confirmButtonColor: '#4f6ef7',
    cancelButtonColor: '#6b7280',
    customClass: {
      confirmButton: 'swal2-confirm-custom',
      cancelButton: 'swal2-cancel-custom',
    },
  };
};

// Agregar estilos globales para los botones
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .swal2-confirm-custom {
      background-color: #4f6ef7 !important;
      color: white !important;
      border: none !important;
      padding: 0.625rem 1.25rem !important;
      border-radius: 0.5rem !important;
      font-weight: 500 !important;
      cursor: pointer !important;
    }
    .swal2-confirm-custom:hover {
      background-color: #3d5ce8 !important;
    }
    .swal2-cancel-custom {
      background-color: #6b7280 !important;
      color: white !important;
      border: none !important;
      padding: 0.625rem 1.25rem !important;
      border-radius: 0.5rem !important;
      font-weight: 500 !important;
      cursor: pointer !important;
    }
    .swal2-cancel-custom:hover {
      background-color: #4b5563 !important;
    }
  `;
  document.head.appendChild(style);
}

export const showConfirmDialog = async (
  title: string,
  text: string,
  confirmButtonText: string = 'Confirmar',
  cancelButtonText: string = 'Cancelar'
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    ...getSwalConfig(),
  });

  return result.isConfirmed;
};

export const showSuccessAlert = (
  title: string,
  text?: string,
  timer: number = 2000
) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer,
    showConfirmButton: false,
    ...getSwalConfig(),
  });
};

export const showErrorAlert = (
  title: string,
  text?: string
) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Entendido',
    ...getSwalConfig(),
  });
};

export const showWarningAlert = (
  title: string,
  text?: string
) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'Entendido',
    ...getSwalConfig(),
  });
};

export const showInfoAlert = (
  title: string,
  text?: string
) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'Entendido',
    ...getSwalConfig(),
  });
};

export const showLoadingAlert = (title: string = 'Procesando...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
    ...getSwalConfig(),
  });
};
