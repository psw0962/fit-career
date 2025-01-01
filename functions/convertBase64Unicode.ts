type ConversionType = 'encode' | 'decode';

export function convertBase64Unicode(
  str: string,
  type: ConversionType
): string {
  if (!str) return '';

  switch (type) {
    case 'encode':
      return btoa(encodeURIComponent(str));

    case 'decode':
      return decodeURIComponent(atob(str));

    default:
      throw new Error(`Unsupported conversion type: ${type}`);
  }
}
