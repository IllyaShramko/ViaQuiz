export interface PickImageOptions {
  accept?: string;
  maxSizeInMb?: number;
}

export function pickImage(options: PickImageOptions = {}): Promise<File | null> {
  const { accept = 'image/*', maxSizeInMb = 5 } = options;

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      if (!file) {
        resolve(null);
        return;
      }

      if (maxSizeInMb && file.size > maxSizeInMb * 1024 * 1024) {
        alert(`File size exceeds limit of ${maxSizeInMb}MB`);
        resolve(null);
        return;
      }

      resolve(file);
    };

    input.oncancel = () => {
      resolve(null);
    };

    input.click();
  });
}
