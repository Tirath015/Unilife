export const currentUser = {
  id: 1,
  fullName: 'Mehakdeep Kaur',
  email: 'student@college.ca',
  studentId: 'C1234567',
  campus: 'Main Campus',
  program: 'Computer Systems Technology',
  avatarUrl: '',
};

export const products = [
  {
    id: 1,
    title: 'Java Programming Textbook',
    price: 48,
    category: 'Textbooks',
    seller: 'Aman S.',
    sellerRating: 4.8,
    postedAt: '2026-07-01',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
    description: 'Used for one semester. Some highlighted pages, but no missing pages. Good for programming courses.',
  },
  {
    id: 2,
    title: 'Scientific Calculator',
    price: 25,
    category: 'Electronics',
    seller: 'Priya M.',
    sellerRating: 4.9,
    postedAt: '2026-07-02',
    imageUrl: 'https://images.unsplash.com/photo-1564473185935-58113cba1e80?auto=format&fit=crop&w=900&q=80',
    description: 'Calculator works perfectly and includes a protective cover. Good for math and accounting classes.',
  },
  {
    id: 3,
    title: 'Desk Chair',
    price: 55,
    category: 'Furniture',
    seller: 'Noah R.',
    sellerRating: 4.7,
    postedAt: '2026-07-03',
    imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80',
    description: 'Comfortable study chair with adjustable height. Pickup preferred near campus residence.',
  },
  {
    id: 4,
    title: 'Winter Jacket',
    price: 70,
    category: 'Clothing',
    seller: 'Sara K.',
    sellerRating: 5.0,
    postedAt: '2026-07-04',
    imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=900&q=80',
    description: 'Warm winter jacket suitable for Canadian weather. Clean, no damage, size medium.',
  },
  {
    id: 5,
    title: 'Laptop Stand',
    price: 18,
    category: 'Electronics',
    seller: 'Jason T.',
    sellerRating: 4.6,
    postedAt: '2026-07-05',
    imageUrl: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=900&q=80',
    description: 'Foldable laptop stand. Easy to carry and helps improve posture during long coding sessions.',
  },
  {
    id: 6,
    title: 'Graphing Notebook Pack',
    price: 12,
    category: 'Miscellaneous',
    seller: 'Emily W.',
    sellerRating: 4.8,
    postedAt: '2026-07-06',
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80',
    description: 'Pack of 3 graphing notebooks, unused. Helpful for math, networking, and project planning notes.',
  },
];

export const categories = ['All', 'Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Miscellaneous'];
export const conditions = ['All', 'New', 'Like New', 'Excellent', 'Good', 'Fair'];

export const notifications = [
  { id: 1, type: 'message', title: 'Seller replied to your message', body: 'Priya M. replied about Scientific Calculator.', unread: true, createdAt: '2026-07-07T09:30:00' },
  { id: 2, type: 'marketplace', title: 'Wishlist item price changed', body: 'Laptop Stand is now listed for $18.', unread: true, createdAt: '2026-07-07T08:15:00' },
  { id: 3, type: 'event', title: 'Event reminder', body: 'Career Prep Workshop starts tomorrow at 2:00 PM.', unread: false, createdAt: '2026-07-06T18:45:00' },
];

export const events = [
  { id: 1, title: 'Career Prep Workshop', date: '2026-07-10', time: '2:00 PM', location: 'Room B204', category: 'Career', registered: false, attendees: 84 },
  { id: 2, title: 'Coding Club Meetup', date: '2026-07-12', time: '5:30 PM', location: 'Innovation Lab', category: 'Academic', registered: true, attendees: 41 },
  { id: 3, title: 'Campus Social Night', date: '2026-07-15', time: '6:00 PM', location: 'Student Centre', category: 'Social', registered: false, attendees: 120 },
];

export const resources = [
  { id: 1, title: 'Library', icon: 'local_library', body: 'Study rooms, book borrowing, research help, and printing support.', contact: 'library@college.ca', hours: '8 AM - 10 PM' },
  { id: 2, title: 'Academic Advising', icon: 'school', body: 'Program planning, course selection, and graduation guidance.', contact: 'advising@college.ca', hours: '9 AM - 5 PM' },
  { id: 3, title: 'IT Support', icon: 'support_agent', body: 'Login help, Wi-Fi issues, software access, and device troubleshooting.', contact: 'it@college.ca', hours: '8 AM - 6 PM' },
  { id: 4, title: 'Counselling', icon: 'health_and_safety', body: 'Confidential mental health and wellness appointments.', contact: 'wellness@college.ca', hours: '9 AM - 4 PM' },
  { id: 5, title: 'Tutoring', icon: 'menu_book', body: 'Peer tutoring for programming, math, writing, and study skills.', contact: 'tutoring@college.ca', hours: '10 AM - 7 PM' },
  { id: 6, title: 'Emergency Contacts', icon: 'emergency', body: 'Campus security, urgent support, and emergency procedures.', contact: 'security@college.ca', hours: '24/7' },
];

export const jobs = [
  { id: 1, title: 'Frontend Developer Co-op', company: 'Campus Innovation Lab', location: 'Hybrid', type: 'Co-op', pay: '$22/hr', deadline: '2026-07-20', skills: ['React', 'CSS', 'Git'] },
  { id: 2, title: 'IT Help Desk Assistant', company: 'Student IT Services', location: 'On Campus', type: 'Part-time', pay: '$19/hr', deadline: '2026-07-18', skills: ['Windows', 'Customer Service', 'Tickets'] },
  { id: 3, title: 'Peer Tutor - Programming', company: 'Learning Centre', location: 'On Campus', type: 'Part-time', pay: '$18/hr', deadline: '2026-07-25', skills: ['Java', 'Python', 'Communication'] },
];

export const discussions = [
  { id: 1, title: 'Best way to prepare for React project demo?', category: 'Frontend', author: 'Manreet', replies: 8, lastActive: '20 min ago', body: 'Looking for tips to explain components, state, and props clearly.' },
  { id: 2, title: 'Anyone selling used networking textbook?', category: 'Marketplace Help', author: 'Agam', replies: 3, lastActive: '1 hr ago', body: 'Need it before next week if possible.' },
  { id: 3, title: 'Good quiet study spaces on campus?', category: 'Campus Life', author: 'Tirath', replies: 12, lastActive: 'Yesterday', body: 'Library is sometimes full. Any other suggestions?' },
];
