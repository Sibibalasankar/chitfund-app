import { useLanguage } from '../contexts/LanguageContext';
import i18n from '../locales';

export const useTranslation = () => {
  const { isLanguageReady } = useLanguage();

  const t = (key) => {
    if (!isLanguageReady) {
      const fallbacks = {
        // Login translations
        'login.title': 'Chit Fund App',
        'login.subtitle': 'Manage your funds efficiently',
        'login.formTitle': 'Login with Mobile Number',
        'login.mobileNumber': 'Mobile Number',
        'login.password': 'Password',
        'login.loginButton': 'Login',
        'login.forgotPassword': 'Forgot Password?',
        'login.noAccount': 'No account?',
        'login.signUp': 'Sign up',
        'login.loading': 'Loading...',
        'login.validation.mobileRequired': 'Mobile number required',
        'login.validation.invalidMobile': 'Invalid mobile number',
        'login.validation.passwordRequired': 'Password required',
        'login.validation.invalidPassword': 'Invalid password',
        'login.errors.loginFailed': 'Login failed',

        // Forgot Password translations
        'forgotPassword.title': 'Forgot Password',
        'forgotPassword.phonePlaceholder': 'Phone number',
        'forgotPassword.newPasswordPlaceholder': 'New Password',
        'forgotPassword.resetButton': 'Reset Password',
        'forgotPassword.success': 'Password reset successful',
        'forgotPassword.errors.emptyFields': 'Enter phone number and new password',
        'forgotPassword.errors.somethingWrong': 'Something went wrong',

        // Register translations
        'register.title': 'Create Account',
        'register.subtitle': 'Join the Chit Fund community',
        'register.namePlaceholder': 'Full Name',
        'register.phonePlaceholder': 'Mobile Number',
        'register.passwordPlaceholder': 'Password',
        'register.confirmPasswordPlaceholder': 'Confirm Password',
        'register.registerButton': 'Create Account',
        'register.terms': 'By creating an account, you agree to our Terms of Service and Privacy Policy',
        'register.haveAccount': 'Already have an account?',
        'register.signIn': 'Sign in',
        'register.success': 'Registration successful. Please login to continue.',
        'register.validation.nameRequired': 'Full name is required',
        'register.validation.invalidName': 'Name must be at least 2 characters',
        'register.validation.phoneRequired': 'Mobile number is required',
        'register.validation.invalidPhone': 'Please enter a valid 10-digit mobile number',
        'register.validation.passwordRequired': 'Password is required',
        'register.validation.invalidPassword': 'Password must be at least 6 characters',
        'register.validation.confirmPasswordRequired': 'Please confirm your password',
        'register.validation.passwordsNotMatch': 'Passwords do not match',
        'register.errors.registrationFailed': 'Registration Failed',
        'register.passwordStrength.veryWeak': 'Very Weak',
        'register.passwordStrength.weak': 'Weak',
        'register.passwordStrength.fair': 'Fair',
        'register.passwordStrength.good': 'Good',
        'register.passwordStrength.strong': 'Strong',
        'register.passwordStrength.veryStrong': 'Very Strong',

        // Common translations
        'common.success': 'Success',
        'common.error': 'Error',
        'common.back': 'Back to Login',

        // --- Admin translations ---
        'admin.dashboardTitle': 'Admin Dashboard',
        'admin.logout': 'Logout',
        'admin.logoutConfirm': 'Are you sure you want to logout?',
        'admin.tabs.overview': 'Overview',
        'admin.tabs.users': 'Users',
        'admin.tabs.funds': 'Funds',
        'admin.tabs.loans': 'Loans',
        'admin.tabs.notifications': 'Notifications',
        'admin.buttons.addUser': 'Add User',
        'admin.buttons.addFund': 'Add Fund',
        'admin.buttons.addLoan': 'Add Loan',
        'admin.buttons.save': 'Save',
        'admin.buttons.cancel': 'Cancel',
        'admin.buttons.delete': 'Delete',
        'admin.buttons.edit': 'Edit',
        'admin.buttons.refresh': 'Refresh',
        'admin.search.users': 'Search by name, phone, or role',
        'admin.alerts.success': 'Success',
        'admin.alerts.error': 'Error',
        'admin.alerts.confirmDelete': 'Are you sure you want to delete',
        'admin.alerts.deleted': 'has been removed',
        'admin.alerts.updated': 'updated successfully',
        'admin.alerts.added': 'added successfully',
        'admin.validation.fillAllFields': 'Please fill all fields',
        'admin.validation.validName': 'Name must be at least 2 characters',
        'admin.validation.validPhone': 'Enter valid 10-digit phone',
        'admin.validation.validAmount': 'Amount must be greater than 0',
        'admin.validation.validInterest': 'Interest rate must be greater than 0',
        'admin.status.active': 'Active',
        'admin.status.inactive': 'Inactive',
        'admin.status.pending': 'Pending',
        'admin.status.approved': 'Approved',
        'admin.status.rejected': 'Rejected',
        'admin.status.completed': 'Completed',
      };

      return fallbacks[key] || key;
    }

    try {
      const result = i18n.t(key);
      return typeof result === 'string' ? result : key;
    } catch (error) {
      return key;
    }
  };

  return { t };
};