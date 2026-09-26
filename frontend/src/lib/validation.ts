/**
 * Comprehensive phone number validation matching Typeform behavior.
 * Checks for:
 * - Allowed characters: 0-9, spaces, +, -, (, ), .
 * - Proper placement of '+' sign (start only, at most one)
 * - ITU-T E.164 standard digit count (minimum 7, maximum 15)
 * - Dummy numbers (all identical repeating digits or common test sequences)
 */
export function validatePhoneNumber(raw: string): string | null {
  if (!raw || !raw.trim()) return null;

  const trimmed = raw.trim();

  // 1. Check for characters that cannot exist in phone numbers
  if (/[^0-9+\-()\s.]/.test(trimmed)) {
    return "Hmm... that phone number contains invalid characters";
  }

  // 2. Check '+' positioning (can only be at start, at most one)
  const plusCount = (trimmed.match(/\+/g) || []).length;
  if (plusCount > 1 || (plusCount === 1 && !trimmed.startsWith("+"))) {
    return "Hmm... that phone number doesn't look right";
  }

  // 3. Extract purely digits
  const digits = trimmed.replace(/\D/g, "");

  // 4. Check minimum and maximum length according to ITU E.164 standard
  if (digits.length < 7) {
    return "Hmm... that phone number looks too short";
  }

  if (digits.length > 15) {
    return "Hmm... that phone number looks too long";
  }

  // 5. Check repeated dummy numbers (e.g. 0000000, 11111111, 9999999999)
  if (/^(\d)\1+$/.test(digits)) {
    return "Please enter a valid phone number";
  }

  // 6. Check common fake / test sequence numbers
  if (digits === "1234567890" || digits === "0123456789" || digits === "12345678") {
    return "Please enter a valid phone number";
  }

  return null;
}

export function validateAnswer(question: any, answer: any): string | null {
  if (!question) return null;

  const isBlank =
    answer === undefined ||
    answer === null ||
    (typeof answer === "string" && answer.trim() === "") ||
    (Array.isArray(answer) && answer.length === 0);

  // 1. Required Check
  if (question.required) {
    if (isBlank) {
      if (question.type === "multiple_choice" || question.type === "dropdown" || question.type === "yes_no" || question.type === "legal") {
        return "Please select an option";
      }
      if (question.type === "rating" || question.type === "opinion_scale" || question.type === "net_promoter_score") {
        return "Please select a rating";
      }
      if (question.type === "phone_number") {
        return "Please enter a phone number";
      }
      return "Please fill this in";
    }

    if (question.type === "contact_info") {
      try {
        const parsed = typeof answer === "string" ? JSON.parse(answer) : answer;
        if (!parsed || (!parsed.firstName?.trim() && !parsed.email?.trim() && !parsed.phone?.trim())) {
          return "Please fill in your contact information";
        }
      } catch {
        return "Please fill in your contact information";
      }
    }

    if (question.type === "address") {
      try {
        const parsed = typeof answer === "string" ? JSON.parse(answer) : answer;
        if (!parsed || (!parsed.address?.trim() && !parsed.city?.trim())) {
          return "Please fill in your address";
        }
      } catch {
        return "Please fill in your address";
      }
    }
  }

  // If blank and not required, it's valid
  if (isBlank) return null;

  // 2. Type-specific Format Validation
  const strVal = typeof answer === "string" ? answer.trim() : String(answer);

  if (question.type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(strVal)) {
      return "Hmm... that email doesn't look right";
    }
  }

  if (question.type === "number") {
    const numRegex = /^-?\d+(\.\d+)?$/;
    if (!numRegex.test(strVal)) {
      return "Please enter a valid number";
    }
  }

  if (question.type === "phone_number") {
    const phoneErr = validatePhoneNumber(strVal);
    if (phoneErr) {
      return phoneErr;
    }
  }

  if (question.type === "website") {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlRegex.test(strVal)) {
      return "Please enter a valid URL (e.g. https://example.com)";
    }
  }

  if (question.type === "contact_info") {
    try {
      const parsed = typeof answer === "string" ? JSON.parse(answer) : answer;
      if (parsed) {
        if (parsed.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(parsed.email.trim())) {
          return "Hmm... that email doesn't look right";
        }
        if (parsed.phone && parsed.phone.trim()) {
          const phoneErr = validatePhoneNumber(parsed.phone);
          if (phoneErr) {
            return phoneErr;
          }
        }
      }
    } catch {}
  }

  return null;
}
