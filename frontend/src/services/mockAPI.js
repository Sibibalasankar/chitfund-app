// Mock API for development until real backend is ready
export const mockAuthAPI = {
  login: (phone, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (phone && password) {
          let userData;
          if (phone === '9876543210') { // Admin phone
            userData = {
              user: {
                id: 1,
                name: 'Admin User',
                email: 'admin@chitfund.com',
                phone: phone,
                role: 'admin',
                joinedDate: '2023-01-15'
              },
              token: 'mock_admin_token_' + Date.now()
            };
          } else if (phone === '9876543211') { // User phone
            userData = {
              user: {
                id: 2,
                name: 'Participant User',
                email: 'user@chitfund.com',
                phone: phone,
                role: 'participant',
                joinedDate: '2023-02-20'
              },
              token: 'mock_user_token_' + Date.now()
            };
          } else {
            // New user registration
            userData = {
              user: {
                id: Math.floor(Math.random() * 1000) + 3,
                name: 'New User',
                email: `${phone}@chitfund.com`,
                phone: phone,
                role: 'participant',
                joinedDate: new Date().toISOString().split('T')[0]
              },
              token: 'mock_user_token_' + Date.now()
            };
          }
          resolve({ data: userData });
        } else {
          reject({ response: { data: { error: 'Invalid credentials' } } });
        }
      }, 1000);
    });
  },
  
  register: (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.name && userData.phone && userData.password) {
          resolve({ 
            data: { 
              message: 'Registration successful',
              user: {
                id: Math.floor(Math.random() * 1000) + 10,
                name: userData.name,
                email: `${userData.phone}@chitfund.com`,
                phone: userData.phone,
                role: 'participant',
                joinedDate: new Date().toISOString().split('T')[0]
              },
              token: 'mock_user_token_' + Date.now()
            } 
          });
        } else {
          reject({ response: { data: { error: 'Registration failed' } } });
        }
      }, 1000);
    });
  }
};

// You can add more mock APIs as needed