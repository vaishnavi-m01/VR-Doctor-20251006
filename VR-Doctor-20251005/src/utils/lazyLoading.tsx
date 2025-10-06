import React, { Suspense, lazy, ComponentType } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LoadingComponent } from '../components/ErrorComponents';

// Loading fallback component
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <LoadingComponent message={message} size="medium" />
);

// Error fallback component
const ErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({ 
  error, 
  retry 
}) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ fontSize: 16, color: '#ef4444', textAlign: 'center', marginBottom: 16 }}>
      Failed to load component
    </Text>
    {error && (
      <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
        {error.message}
      </Text>
    )}
    {retry && (
      <Text 
        style={{ fontSize: 16, color: '#3b82f6', textAlign: 'center' }}
        onPress={retry}
      >
        Retry
      </Text>
    )}
  </View>
);

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<P extends object>(
  importFunction: () => Promise<{ default: ComponentType<P> }>,
  fallbackMessage?: string
) {
  const LazyComponent = lazy(importFunction);

  return React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
}

// Lazy load assessment components
export const LazyPatientScreening = withLazyLoading(
  () => import('../screens/assessments/PatientScreening'),
  'Loading Patient Screening...'
);

export const LazySocioDemographic = withLazyLoading(
  () => import('../screens/assessments/SocioDemographic'),
  'Loading Socio-Demographic Form...'
);

export const LazyFactG = withLazyLoading(
  () => import('../screens/assessments/FactG'),
  'Loading FACT-G Assessment...'
);

export const LazyPreVR = withLazyLoading(
  () => import('../screens/assessments/PreVR'),
  'Loading Pre-VR Assessment...'
);

export const LazyPostVRAssessment = withLazyLoading(
  () => import('../screens/assessments/PostVRAssessment'),
  'Loading Post-VR Assessment...'
);

export const LazyStudyObservation = withLazyLoading(
  () => import('../screens/assessments/StudyObservation'),
  'Loading Study Observation...'
);

export const LazyAdverseEventForm = withLazyLoading(
  () => import('../screens/assessments/AdverseEventForm'),
  'Loading Adverse Event Form...'
);

export const LazyExitInterview = withLazyLoading(
  () => import('../screens/assessments/ExitInterview'),
  'Loading Exit Interview...'
);

export const LazyPreAndPostVR = withLazyLoading(
  () => import('../screens/assessments/PreAndPostVR'),
  'Loading Pre & Post VR...'
);

export const LazyScreening = withLazyLoading(
  () => import('../screens/assessments/Screening'),
  'Loading Screening...'
);

// Lazy load patient components
export const LazyPatientDatabaseScreen = withLazyLoading(
  () => import('../screens/patients/PatientDatabaseScreen'),
  'Loading Patient Database...'
);

export const LazyPatientAssessmentSplit = withLazyLoading(
  () => import('../screens/patients/PatientAssessmentSplit'),
  'Loading Patient Assessment...'
);

export const LazyDistressThermometerScreen = withLazyLoading(
  () => import('../screens/patients/components/assesment/components/DistressThermometerScreen'),
  'Loading Distress Thermometer...'
);

export const LazyEdmontonFactGScreen = withLazyLoading(
  () => import('../screens/patients/components/assesment/components/EdmontonFactGScreen'),
  'Loading Edmonton FACT-G...'
);

// Lazy load dashboard components
export const LazyDoctorDashboard = withLazyLoading(
  () => import('../screens/dashboard/DoctorDashboard'),
  'Loading Doctor Dashboard...'
);

export const LazyHome = withLazyLoading(
  () => import('../screens/dashboard/Home'),
  'Loading Home...'
);

// Lazy load VR session components
export const LazySessionSetupScreen = withLazyLoading(
  () => import('../screens/vr-sessions/SessionSetupScreen'),
  'Loading Session Setup...'
);

export const LazySessionControlScreen = withLazyLoading(
  () => import('../screens/vr-sessions/SessionControlScreen'),
  'Loading Session Control...'
);

export const LazySessionCompletedScreen = withLazyLoading(
  () => import('../screens/vr-sessions/SessionCompletedScreen'),
  'Loading Session Completed...'
);

// Lazy load auth components
export const LazyLogin = withLazyLoading(
  () => import('../screens/auth/Login'),
  'Loading Login...'
);

export const LazyProfile = withLazyLoading(
  () => import('../screens/auth/Profile'),
  'Loading Profile...'
);

// Lazy load information components
export const LazyInvestigatorsBrochure = withLazyLoading(
  () => import('../screens/information/InvestigatorsBrochure'),
  'Loading Investigators Brochure...'
);

// Lazy load tab components
export const LazyHomeTab = withLazyLoading(
  () => import('../screens/tabs/home_tab'),
  'Loading Home Tab...'
);

export const LazyReportTab = withLazyLoading(
  () => import('../screens/tabs/report_tab'),
  'Loading Report Tab...'
);

// Utility function to create lazy components with custom loading
export function createLazyComponent<P extends object>(
  importFunction: () => Promise<{ default: ComponentType<P> }>,
  options: {
    fallbackMessage?: string;
    fallbackComponent?: ComponentType;
    errorBoundary?: boolean;
  } = {}
) {
  const {
    fallbackMessage = 'Loading...',
    fallbackComponent,
    errorBoundary = true
  } = options;

  const LazyComponent = lazy(importFunction);
  const FallbackComponent = fallbackComponent || (() => <LoadingFallback message={fallbackMessage} />);

  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const content = (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    );

    if (errorBoundary) {
      const ErrorBoundary = require('../components/ErrorBoundary').default;
      return (
        <ErrorBoundary>
          {content}
        </ErrorBoundary>
      );
    }

    return content;
  });

  WrappedComponent.displayName = `LazyComponent(${(LazyComponent as any).displayName || 'Unknown'})`;
  
  return WrappedComponent;
}

// Hook for lazy loading with retry functionality
export function useLazyComponent<P extends object>(
  importFunction: () => Promise<{ default: ComponentType<P> }>,
  fallbackMessage?: string
) {
  const [Component, setComponent] = React.useState<ComponentType<P> | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const module = await importFunction();
      setComponent(() => module.default);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    } finally {
      setIsLoading(false);
    }
  }, [importFunction]);

  React.useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  const retry = React.useCallback(() => {
    loadComponent();
  }, [loadComponent]);

  return {
    Component,
    isLoading,
    error,
    retry,
  };
}

export default {
  withLazyLoading,
  createLazyComponent,
  useLazyComponent,
  LoadingFallback,
  ErrorFallback,
};
