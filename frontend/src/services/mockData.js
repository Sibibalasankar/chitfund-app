// Mock data for development
export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    phone: '9876543210',
    role: 'admin',
    status: 'active',
    joinedDate: '2023-01-15',
    totalPaid: 15000,
    pendingAmount: 0
  },
  {
    id: 2,
    name: 'Rahul Sharma',
    phone: '9876543211',
    role: 'participant',
    status: 'active',
    joinedDate: '2023-02-20',
    totalPaid: 12000,
    pendingAmount: 3000
  },
  {
    id: 3,
    name: 'Priya Patel',
    phone: '9876543212',
    role: 'participant',
    status: 'active',
    joinedDate: '2023-03-10',
    totalPaid: 9000,
    pendingAmount: 6000
  },
  {
    id: 4,
    name: 'Amit Kumar',
    phone: '9876543213',
    role: 'participant',
    status: 'inactive',
    joinedDate: '2023-04-05',
    totalPaid: 15000,
    pendingAmount: 0
  }
];

export const mockFunds = [
  {
    id: 1,
    participantId: 2,
    participantName: 'Rahul Sharma',
    amount: 3000,
    status: 'pending',
    paymentDate: null,
    dueDate: '2023-11-05',
    adminNote: 'Monthly installment'
  },
  {
    id: 2,
    participantId: 3,
    participantName: 'Priya Patel',
    amount: 3000,
    status: 'pending',
    paymentDate: null,
    dueDate: '2023-11-10',
    adminNote: 'Monthly installment'
  },
  {
    id: 3,
    participantId: 2,
    participantName: 'Rahul Sharma',
    amount: 3000,
    status: 'paid',
    paymentDate: '2023-10-05',
    dueDate: '2023-10-05',
    adminNote: 'Payment received via UPI'
  },
  {
    id: 4,
    participantId: 3,
    participantName: 'Priya Patel',
    amount: 3000,
    status: 'paid',
    paymentDate: '2023-10-10',
    dueDate: '2023-10-10',
    adminNote: 'Cash payment'
  }
];

export const mockNotifications = [
  {
    id: 1,
    userId: 2,
    message: 'Payment of ₹3,000 received from Rahul Sharma',
    type: 'payment_received',
    isRead: true,
    createdAt: '2023-10-05 14:30'
  },
  {
    id: 2,
    userId: 3,
    message: 'Payment reminder: ₹3,000 due on November 10',
    type: 'payment_reminder',
    isRead: false,
    createdAt: '2023-10-28 10:15'
  },
  {
    id: 3,
    userId: 2,
    message: 'New fund of ₹3,000 added to your account',
    type: 'fund_added',
    isRead: true,
    createdAt: '2023-10-01 09:45'
  },
  {
    id: 4,
    userId: 1,
    message: 'New participant Priya Patel joined the chit fund',
    type: 'new_member',
    isRead: false,
    createdAt: '2023-10-15 16:20'
  }
];

export const mockUserFunds = [
  {
    id: 1,
    amount: 3000,
    status: 'pending',
    dueDate: '2023-11-05',
    paymentDate: null,
    adminNote: 'Monthly installment'
  },
  {
    id: 2,
    amount: 3000,
    status: 'paid',
    dueDate: '2023-10-05',
    paymentDate: '2023-10-05',
    adminNote: 'Payment received via UPI'
  },
  {
    id: 3,
    amount: 3000,
    status: 'paid',
    dueDate: '2023-09-05',
    paymentDate: '2023-09-05',
    adminNote: 'Cash payment'
  }
];

// Generate mock data functions
export const generateMockData = (userId) => {
  return {
    users: mockUsers,
    funds: mockFunds,
    notifications: mockNotifications.filter(n => n.userId === userId),
    userFunds: mockUserFunds
  };
};