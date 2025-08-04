// Simple client-side academic email validation for US colleges
// Removed academic-email-verifier due to Node.js fs module dependency

export interface StudentValidationResult {
  isAcademic: boolean;
  institutionName?: string;
  isValidStudent: boolean;
  error?: string;
}

export interface StudentInfo {
  email: string;
  institutionName?: string;
  isVerifiedStudent: boolean;
}

/**
 * Common US academic email domains
 */
export const US_ACADEMIC_DOMAINS = [
  '.edu', // Standard US educational institutions
  '.ac.us', // Some US academic institutions
];

/**
 * Quick check for US academic domains
 */
export function isLikelyAcademicEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  return US_ACADEMIC_DOMAINS.some(academicDomain => 
    domain.endsWith(academicDomain)
  );
}

/**
 * Simple validation for US academic emails
 */
export async function validateStudentEmail(email: string): Promise<StudentValidationResult> {
  try {
    const isAcademic = isLikelyAcademicEmail(email);
    
    if (!isAcademic) {
      return {
        isAcademic: false,
        isValidStudent: false,
        error: 'Please use your US academic email address (.edu)'
      };
    }

    // Extract institution name from email domain
    const domain = email.toLowerCase().split('@')[1];
    const institutionName = domain ? domain.replace('.edu', '').replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : undefined;
    
    return {
      isAcademic: true,
      institutionName,
      isValidStudent: true
    };
  } catch (error) {
    console.error('Student email validation error:', error);
    return {
      isAcademic: false,
      isValidStudent: false,
      error: 'Unable to verify academic email. Please try again.'
    };
  }
}

/**
 * Checks if an email is from a US academic institution
 */
export async function isAcademicEmail(email: string): Promise<boolean> {
  return isLikelyAcademicEmail(email);
}

/**
 * Gets the institution name for an academic email
 */
export async function getInstitutionName(email: string): Promise<string | null> {
  try {
    const domain = email.toLowerCase().split('@')[1];
    if (!domain) return null;
    
    return domain.replace('.edu', '').replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  } catch (error) {
    console.error('Institution name lookup error:', error);
    return null;
  }
}

/**
 * Validates student email during signup/signin process
 */
export async function validateStudentForAuth(email: string): Promise<{
  isValid: boolean;
  institutionName?: string;
  error?: string;
}> {
  const result = await validateStudentEmail(email);
  
  if (!result.isValidStudent) {
    return {
      isValid: false,
      error: result.error || 'Please use a valid US academic email address'
    };
  }

  return {
    isValid: true,
    institutionName: result.institutionName
  };
} 