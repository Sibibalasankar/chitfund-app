import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { 
  getDeviceType, 
  isDesktop, 
  isTablet, 
  isMobile,
  getContainerWidth,
  getGridColumns,
  getSidebarWidth,
  getContentWidth,
  getModalWidth,
  getCardWidth,
  getResponsiveWidth,
  getResponsivePadding,
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveBorderRadius,
  isLandscape,
  getPlatformAdjustments,
  getWebScrollProps
} from '../utils/responsive';

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [deviceType, setDeviceType] = useState(getDeviceType());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setDeviceType(getDeviceType());
    });

    return () => subscription?.remove();
  }, []);

  return {
    // Screen dimensions
    screenWidth: dimensions.width,
    screenHeight: dimensions.height,
    
    // Device type
    deviceType,
    isDesktop: isDesktop(),
    isTablet: isTablet(),
    isMobile: isMobile(),
    
    // Layout calculations
    containerWidth: getContainerWidth(),
    gridColumns: getGridColumns(),
    sidebarWidth: getSidebarWidth(),
    contentWidth: getContentWidth(),
    modalWidth: getModalWidth(),
    
    // Responsive functions
    getCardWidth,
    getModalWidth,
    getResponsiveWidth,
    getResponsivePadding,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getResponsiveBorderRadius,
    
    // Orientation
    isLandscape: isLandscape(),
    
    // Platform
    ...getPlatformAdjustments(),
    
    // Web-specific scroll properties
    webScrollProps: getWebScrollProps(),
  };
};

export default useResponsive;
