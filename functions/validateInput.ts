export function validateInput(value: string, type: string): boolean {
  switch (type) {
    case 'phonePart':
      return /^\d{0,4}$/.test(value); // 0~4자리 숫자만 허용
    case 'email':
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // 이메일 형식
      return emailRegex.test(value);
    default:
      return false;
  }
}
