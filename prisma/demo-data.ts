// Seeded cities and areas. Areas are listed in rough geographic order so the
// index difference works as "nearest area" (no GPS in Kirayo).
export const CITIES: { name: string; areas: string[] }[] = [
  { name: 'Bengaluru', areas: ['Hebbal', 'Malleshwaram', 'Indiranagar', 'Whitefield', 'Koramangala', 'HSR Layout', 'Jayanagar', 'JP Nagar'] },
  { name: 'Mumbai', areas: ['Thane West', 'Malad', 'Goregaon', 'Powai', 'Andheri West', 'Juhu', 'Bandra West', 'Colaba'] },
  { name: 'Delhi', areas: ['Rohini', 'Karol Bagh', 'Connaught Place', 'Mayur Vihar', 'Lajpat Nagar', 'Hauz Khas', 'Saket', 'Dwarka'] },
  { name: 'Noida', areas: ['Sector 18', 'Sector 50', 'Sector 62', 'Sector 76', 'Sector 137', 'Greater Noida West'] },
  { name: 'Gurugram', areas: ['Palam Vihar', 'DLF Phase 3', 'Cyber City', 'DLF Phase 1', 'Golf Course Road', 'Sector 56', 'Sohna Road'] },
  { name: 'Pune', areas: ['Aundh', 'Baner', 'Hinjewadi', 'Kothrud', 'Koregaon Park', 'Kalyani Nagar', 'Viman Nagar', 'Hadapsar'] },
];

export const ADMIN = { email: 'admin@kirayo.test', name: 'Kirayo Admin' };
