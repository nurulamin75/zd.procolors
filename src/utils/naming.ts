import { getSettings } from './settings';

// Map shade numbers to descriptive names
const SHADE_NAME_MAP: Record<number, string> = {
  25: 'lightest',
  50: 'lighter',
  100: 'light',
  200: 'lighter-medium',
  300: 'medium-light',
  400: 'medium',
  500: 'base',
  600: 'medium-dark',
  700: 'dark',
  800: 'darker',
  900: 'darkest',
  950: 'darkest-plus',
  975: 'darkest-max'
};

// Get abbreviated group name (first letter)
function getAbbreviatedGroup(groupName: string): string {
  if (!groupName) return '';
  return groupName.charAt(0).toLowerCase();
}

// Format shade name based on naming convention
export function formatShadeName(groupName: string, shade: number, namingConvention?: string, customPattern?: string): string {
  // Get settings if not provided
  if (!namingConvention) {
    const settings = getSettings();
    namingConvention = settings.namingConvention;
    customPattern = settings.customNamingPattern;
  }

  // Normalize group name
  const normalizedGroup = groupName || 'color';

  switch (namingConvention) {
    case 'kebab-capital':
      // Primary-100
      return `${normalizedGroup.charAt(0).toUpperCase() + normalizedGroup.slice(1)}-${shade}`;
    
    case 'dot-lowercase':
      // primary.lightest
      const shadeName = SHADE_NAME_MAP[shade] || shade.toString();
      return `${normalizedGroup.toLowerCase()}.${shadeName}`;
    
    case 'abbreviated':
      // p1 / 100
      const abbrev = getAbbreviatedGroup(normalizedGroup);
      // For abbreviated, use first digit of shade (e.g., 100 -> 1, 500 -> 5)
      const firstDigit = shade.toString().charAt(0);
      return `${abbrev}${firstDigit} / ${shade}`;
    
    case 'custom':
      // Use custom pattern with {group} and {shade} placeholders
      const pattern = customPattern || '{group}-{shade}';
      return pattern
        .replace(/{group}/g, normalizedGroup)
        .replace(/{shade}/g, shade.toString());
    
    default:
      // Fallback to just the shade number
      return shade.toString();
  }
}

