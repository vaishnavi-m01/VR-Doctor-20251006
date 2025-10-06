// Example of how to use the authentication system with API calls
import { apiService } from './api';
import { apiClient } from './apiClient';
import { authService } from './authService';

// Example 1: Using the main API service (automatically includes JWT token)
export const exampleApiCalls = {
  // GET request with automatic JWT token
  async getPatients() {
    try {
      const response = await apiService.get('/GetPatients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // POST request with automatic JWT token
  async createPatient(patientData: any) {
    try {
      const response = await apiService.post('/CreatePatient', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // PUT request with automatic JWT token
  async updatePatient(patientId: string, patientData: any) {
    try {
      const response = await apiService.put(`/UpdatePatient/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  // DELETE request with automatic JWT token
  async deletePatient(patientId: string) {
    try {
      const response = await apiService.delete(`/DeletePatient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }
};

// Example 2: Using axios client (automatically includes JWT token)
export const exampleAxiosCalls = {
  async getAssessments() {
    try {
      const response = await apiClient.get('/GetAssessments');
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  async submitAssessment(assessmentData: any) {
    try {
      const response = await apiClient.post('/SubmitAssessment', assessmentData);
      return response.data;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  }
};

// Example 3: Manual token usage (if needed for special cases)
export const exampleManualTokenUsage = {
  async customApiCall() {
    try {
      // Get the current token
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Check if token is valid
      if (!authService.isTokenValid()) {
        throw new Error('Authentication token has expired');
      }

      // Make API call with manual token
      const response = await fetch('https://dev.3framesailabs.com:8060/api/CustomEndpoint', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in custom API call:', error);
      throw error;
    }
  }
};

// Example 4: Using the auth service directly in components
export const exampleComponentUsage = `
// In a React component:
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      // This will automatically include the JWT token
      const response = await apiService.get('/GetMyData');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // If it's an auth error, the user will be automatically logged out
    }
  };

  const handleLogout = async () => {
    await logout();
    // User will be redirected to login screen
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View>
      <Text>Welcome, {user?.FirstName}!</Text>
      <Button onPress={handleLogout} title="Logout" />
    </View>
  );
};
`;

// Example 5: Error handling with automatic logout
export const exampleErrorHandling = {
  async apiCallWithErrorHandling() {
    try {
      const response = await apiService.get('/ProtectedEndpoint');
      return response.data;
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.status === 401) {
        // The API client will automatically logout the user
        // and show an error message
        console.log('User has been logged out due to authentication error');
      } else if (error.status === 403) {
        console.log('Access denied - insufficient permissions');
      } else {
        console.log('Other error occurred:', error.message);
      }
      throw error;
    }
  }
};
