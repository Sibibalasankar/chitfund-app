import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './colors';
import { 
  getDeviceType, 
  getResponsivePadding, 
  getResponsiveFontSize, 
  getResponsiveSpacing,
  getResponsiveBorderRadius,
  getContainerWidth,
  getGridColumns,
  isDesktop
} from '../utils/responsive';

const { width: screenWidth } = Dimensions.get('window');
const deviceType = getDeviceType();

// Responsive values
const containerPadding = getResponsivePadding(20, 24, 32);
const cardPadding = getResponsivePadding(15, 18, 24);
const cardBorderRadius = getResponsiveBorderRadius(8, 12, 16);
const buttonPadding = getResponsivePadding(15, 18, 20);
const inputHeight = getResponsivePadding(50, 55, 60);
const inputPadding = getResponsivePadding(15, 18, 20);
const inputBorderRadius = getResponsiveBorderRadius(8, 10, 12);

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: containerPadding,
    backgroundColor: colors.light,
    ...(isDesktop() && {
      maxWidth: getContainerWidth(),
      alignSelf: 'center',
    }),
  },
  containerFullWidth: {
    flex: 1,
    backgroundColor: colors.light,
  },
  containerCentered: {
    flex: 1,
    padding: containerPadding,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    ...(isDesktop() && {
      maxWidth: getContainerWidth(),
      alignSelf: 'center',
    }),
  },
  card: {
    backgroundColor: colors.white,
    padding: cardPadding,
    borderRadius: cardBorderRadius,
    marginBottom: getResponsiveSpacing(15, 18, 20),
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    ...(isDesktop() && {
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  cardTitle: {
    fontSize: getResponsiveFontSize(18, 20, 22),
    fontWeight: 'bold',
    marginBottom: getResponsiveSpacing(10, 12, 15),
    color: colors.dark,
  },
  button: {
    padding: buttonPadding,
    borderRadius: getResponsiveBorderRadius(8, 10, 12),
    alignItems: 'center',
    justifyContent: 'center',
    ...(isDesktop() && {
      minHeight: 48,
      cursor: 'pointer',
    }),
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16, 17, 18),
  },
  input: {
    height: inputHeight,
    borderColor: colors.gray,
    borderWidth: 1,
    marginBottom: getResponsiveSpacing(15, 18, 20),
    paddingHorizontal: inputPadding,
    borderRadius: inputBorderRadius,
    backgroundColor: colors.white,
    fontSize: getResponsiveFontSize(16, 17, 18),
    ...(isDesktop() && {
      borderWidth: 2,
      '&:focus': {
        borderColor: colors.primary,
        outline: 'none',
      },
    }),
  },
  textCenter: {
    textAlign: 'center',
  },
  // Desktop-specific styles
  desktopContainer: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: colors.light,
  },
  desktopSidebar: {
    width: 250,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.gray,
    paddingTop: 20,
  },
  desktopContent: {
    flex: 1,
    padding: containerPadding,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  desktopGridItem: {
    width: getCardWidth(),
    marginBottom: getResponsiveSpacing(15, 18, 20),
  },
  // Responsive text styles
  heading1: {
    fontSize: getResponsiveFontSize(24, 28, 32),
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: getResponsiveSpacing(15, 18, 20),
  },
  heading2: {
    fontSize: getResponsiveFontSize(20, 22, 24),
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: getResponsiveSpacing(12, 15, 18),
  },
  heading3: {
    fontSize: getResponsiveFontSize(18, 20, 22),
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: getResponsiveSpacing(10, 12, 15),
  },
  bodyText: {
    fontSize: getResponsiveFontSize(14, 15, 16),
    color: colors.dark,
    lineHeight: getResponsiveFontSize(20, 22, 24),
  },
  captionText: {
    fontSize: getResponsiveFontSize(12, 13, 14),
    color: colors.gray,
  },
  // Responsive spacing utilities
  marginSmall: {
    margin: getResponsiveSpacing(8, 10, 12),
  },
  marginMedium: {
    margin: getResponsiveSpacing(15, 18, 20),
  },
  marginLarge: {
    margin: getResponsiveSpacing(20, 24, 32),
  },
  paddingSmall: {
    padding: getResponsiveSpacing(8, 10, 12),
  },
  paddingMedium: {
    padding: getResponsiveSpacing(15, 18, 20),
  },
  paddingLarge: {
    padding: getResponsiveSpacing(20, 24, 32),
  },
});