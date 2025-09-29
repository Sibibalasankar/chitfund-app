// hooks/useTranslation.js
import { useLanguage } from '../contexts/LanguageContext';
import i18n from '../locales';

export const useTranslation = () => {
  const { isLanguageReady, currentLanguage } = useLanguage();

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

        // Admin translations
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
        'admin.status.paid': 'Paid',
        'admin.status.approved': 'Approved',
        'admin.status.updatedTo': 'updated to',
        'admin.status.rejected': 'Rejected',
        'admin.status.completed': 'Completed',

        // UserList translations
        'userList.unknown': 'Unknown',
        'userList.notAvailable': 'N/A',
        'userList.joined': 'Joined',
        'userList.paid': 'Paid',
        'userList.pending': 'Pending',
        'userList.loans': 'Loans',
        'userList.installments': 'Installments',

        // UserForm translations
        'userForm.addUser': 'Add New User',
        'userForm.editUser': 'Edit User',
        'userForm.namePlaceholder': 'Full Name',
        'userForm.phonePlaceholder': 'Mobile Number (10 digits)',
        'userForm.roleLabel': 'Role',
        'userForm.roleParticipant': 'Participant',
        'userForm.roleAdmin': 'Admin',
        'userForm.statusLabel': 'Status',
        'userForm.updateUser': 'Update User',
        'userForm.addUserButton': 'Add User',

        // Stats translations
        'stats.dashboardTitle': 'Dashboard Overview',
        'stats.dashboardSubtitle': 'Track your fund management',
        'stats.totalUsers': 'Total Users',
        'stats.paidFunds': 'Paid Funds',
        'stats.pendingFunds': 'Pending Funds',
        'stats.totalCollected': 'Total Collected',
        'stats.quickActions': 'Quick Actions',
        'stats.recentActivities': 'Recent Activities',
        'stats.viewAll': 'View All',
        'stats.noActivities': 'No Recent Activities',
        'stats.activitiesWillAppear': 'Your recent fund activities will appear here',

        // Fund translations
        'fundForm.editTitle': 'Edit Fund / Transaction',
        'fundForm.addTitle': 'Add Fund / Transaction',
        'fundForm.participantLabel': 'Participant',
        'fundForm.amountLabel': 'Amount',
        'fundForm.amountPlaceholder': 'Enter amount',
        'fundForm.dueDateLabel': 'Due Date',
        'fundForm.selectDate': 'Select date',
        'fundForm.statusLabel': 'Status',
        'fundForm.deleteConfirmation': 'Are you sure you want to delete this fund?',
        'fundForm.saveError': 'Failed to save fund.',
        'fundForm.saving': 'Saving...',
        'fundForm.updateButton': 'Update',
        'fundForm.saveButton': 'Save',
        'fundList.due': 'Due',
        'fundList.paid': 'Paid',
        'fundList.markPaid': 'Mark Paid',
        'fundList.filter': 'Filter',
        'fundList.sort': 'Sort',
        'fundList.all': 'All',
        'fundList.recent': 'Recent',
        'fundList.dueDate': 'Due Date',
        'fundList.amount': 'Amount',

        // Loan translations
        'loanForm.title': 'Loan Details',
        'loanForm.participantLabel': 'Participant',
        'loanForm.principalAmountLabel': 'Principal Amount',
        'loanForm.interestRateLabel': 'Interest Rate',
        'loanForm.totalInstallmentsLabel': 'Total Installments',
        'loanForm.paidInstallmentsLabel': 'Paid Installments',
        'loanForm.startDateLabel': 'Start Date',
        'loanForm.statusLabel': 'Status',
        'loanForm.saveButton': 'Save Loan',
        'loanForm.updateButton': 'Update Loan'
      };

      return fallbacks[key] || key;
    }

    try {
      const result = i18n.t(key);
      // If translation returns the key itself (meaning not found), try fallback
      if (result === key) {
        const fallbackKeys = {
          'userList.unknown': 'Unknown',
          'userList.notAvailable': 'N/A',
          'userList.joined': 'Joined',
          'userList.paid': 'Paid',
          'userList.pending': 'Pending',
          'userList.loans': 'Loans',
          'userList.installments': 'Installments',
          'userForm.roleAdmin': 'Admin',
          'userForm.roleParticipant': 'Participant',
          'admin.status.active': 'Active',
          'admin.status.inactive': 'Inactive',
          'admin.status.pending': 'Pending',
          'admin.status.paid': 'Paid',
          'admin.status.approved': 'Approved',
          'admin.status.rejected': 'Rejected',
          'admin.status.completed': 'Completed'
        };
        return fallbackKeys[key] || key;
      }
      return typeof result === 'string' ? result : key;
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return key;
    }
  };

  return {
    t,
    currentLanguage,
    isLanguageReady
  };
};