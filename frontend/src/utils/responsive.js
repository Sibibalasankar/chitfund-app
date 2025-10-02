import { Dimensions, Platform } from 'react-native';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

// Device type detection
export const getDeviceType = () => {
  if (screenWidth < BREAKPOINTS.mobile) return 'mobile';
  if (screenWidth < BREAKPOINTS.tablet) return 'mobile';
  if (screenWidth < BREAKPOINTS.desktop) return 'tablet';
  return 'desktop';
};

// Check if device is desktop
export const isDesktop = () => getDeviceType() === 'desktop';
export const isTablet = () => getDeviceType() === 'tablet';
export const isMobile = () => getDeviceType() === 'mobile';

// Responsive width calculations
export const getResponsiveWidth = (mobileWidth, tabletWidth, desktopWidth) => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return mobileWidth;
    case 'tablet':
      return tabletWidth;
    case 'desktop':
      return desktopWidth;
    default:
      return mobileWidth;
  }
};

// Responsive padding calculations
export const getResponsivePadding = (mobilePadding, tabletPadding, desktopPadding) => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return mobilePadding;
    case 'tablet':
      return tabletPadding;
    case 'desktop':
      return desktopPadding;
    default:
      return mobilePadding;
  }
};

// Responsive font size calculations
export const getResponsiveFontSize = (mobileSize, tabletSize, desktopSize) => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return mobileSize;
    case 'tablet':
      return tabletSize;
    case 'desktop':
      return desktopSize;
    default:
      return mobileSize;
  }
};

// Container width calculations
export const getContainerWidth = () => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return screenWidth;
    case 'tablet':
      return Math.min(screenWidth, 600);
    case 'desktop':
      return Math.min(screenWidth, 1200);
    default:
      return screenWidth;
  }
};

// Grid column calculations
export const getGridColumns = () => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return 1;
    case 'tablet':
      return 2;
    case 'desktop':
      return 3;
    default:
      return 1;
  }
};

// Sidebar width for desktop
export const getSidebarWidth = () => {
  return isDesktop() ? 250 : 0;
};

// Content area width accounting for sidebar
export const getContentWidth = () => {
  return isDesktop() ? screenWidth - getSidebarWidth() : screenWidth;
};

// Modal width calculations
export const getModalWidth = () => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return screenWidth * 0.9;
    case 'tablet':
      return Math.min(screenWidth * 0.7, 500);
    case 'desktop':
      return Math.min(screenWidth * 0.5, 600);
    default:
      return screenWidth * 0.9;
  }
};

// Card width calculations for grid layouts
export const getCardWidth = (columns = null) => {
  const cols = columns || getGridColumns();
  const containerWidth = getContainerWidth();
  const padding = getResponsivePadding(16, 20, 24);
  
  return (containerWidth - padding * (cols + 1)) / cols;
};

// Responsive spacing
export const getResponsiveSpacing = (mobileSpacing, tabletSpacing, desktopSpacing) => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return mobileSpacing;
    case 'tablet':
      return tabletSpacing;
    case 'desktop':
      return desktopSpacing;
    default:
      return mobileSpacing;
  }
};

// Check if screen is in landscape mode
export const isLandscape = () => screenWidth > screenHeight;

// Get responsive border radius
export const getResponsiveBorderRadius = (mobileRadius, tabletRadius, desktopRadius) => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return mobileRadius;
    case 'tablet':
      return tabletRadius;
    case 'desktop':
      return desktopRadius;
    default:
      return mobileRadius;
  }
};

// Platform-specific adjustments
export const getPlatformAdjustments = () => {
  return {
    isWeb: Platform.OS === 'web',
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  };
};

// Web-specific scroll properties for better desktop experience
export const getWebScrollProps = () => {
  if (Platform.OS === 'web') {
    return {
      scrollEventThrottle: 16,
      decelerationRate: 'normal',
      bounces: true,
      alwaysBounceVertical: false,
      // Web-specific properties for better scrolling
      style: {
        WebkitOverflowScrolling: 'touch',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
      }
    };
  }
  return {};
};

// Export screen dimensions for direct use
export { screenWidth, screenHeight };
