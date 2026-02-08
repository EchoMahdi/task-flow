/**
 * LanguageSwitcher Component
 * 
 * A fully independent and reusable component for language selection.
 * 
 * Usage:
 * 
 * // In any component
 * import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
 * 
 * // As dropdown (default)
 * <LanguageSwitcher />
 * 
 * // As toggle button
 * <LanguageSwitcher variant="toggle" />
 * 
 * // As button group
 * <LanguageSwitcher variant="buttons" />
 * 
 * // With callbacks
 * <LanguageSwitcher onChange={(lang) => console.log('Language changed to:', lang)} />
 */

export { LanguageSwitcher } from './LanguageSwitcher';
export default LanguageSwitcher;
