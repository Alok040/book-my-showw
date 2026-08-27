export const fallbackMovies = [
  {
    id: 1,
    title: 'Kalki 2898 AD',
    durationMinutes: 180,
    languages: ['HINDI', 'TELUGU'],
    genres: ['SCI_FICTION', 'ACTION', 'DRAMA'],
    cast: ['Prabhas', 'Deepika Padukone', 'Amitabh Bachchan'],
    releaseDate: '2024-06-27',
    rating: 8.4,
    votes: '1.2L',
    certification: 'U/A',
    description: 'A futuristic epic where the last hope of humanity rises against an ancient darkness.',
    posterUrl: '/assets/kalki.jpg',
    backdropUrl: '/assets/kalki.jpg',
    trailerUrl: '#'
  },
  {
    id: 2,
    title: 'Stree 2',
    durationMinutes: 149,
    languages: ['HINDI'],
    genres: ['HORRER', 'COMADY', 'THRILL'],
    cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi'],
    releaseDate: '2024-08-15',
    rating: 8.8,
    votes: '2.1L',
    certification: 'U/A',
    description: 'The legend returns as a new supernatural mystery haunts the town once again.',
    posterUrl: '/assets/stree.jpg',
    backdropUrl: '/assets/stree.jpg',
    trailerUrl: '#'
  },
  {
    id: 3,
    title: 'Fighter',
    durationMinutes: 166,
    languages: ['HINDI', 'TAMIL', 'TELUGU'],
    genres: ['ACTION', 'DRAMA', 'WAR'],
    cast: ['Hrithik Roshan', 'Deepika Padukone', 'Anil Kapoor', 'Karan Singh Grover'],
    releaseDate: '2024-01-25',
    rating: 7.2,
    votes: '45K',
    certification: 'U/A',
    description: 'India is under imminent threat. A group of fearless Indian Air Force officers take to the skies to complete the most dangerous mission of their careers — one that could change the course of history.',
    posterUrl: '/assets/fighter.jpg',
    backdropUrl: '/assets/fighter-backdrop.png',
    trailerUrl: '#'
  },
  {
    id: 4,
    title: 'Pushpa 2: The Rule',
    durationMinutes: 200,
    languages: ['TELUGU', 'HINDI'],
    genres: ['ACTION', 'CRIME', 'DRAMA'],
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    releaseDate: '2024-12-05',
    rating: 7.9,
    votes: '89K',
    certification: 'A',
    description: 'Pushpa faces a new chapter where power, ambition and loyalty collide.',
    posterUrl: '/assets/pushpa.jpg',
    backdropUrl: '/assets/pushpa.jpg',
    trailerUrl: '#'
  },
  {
    id: 5,
    title: 'Devara',
    durationMinutes: 172,
    languages: ['TELUGU', 'HINDI'],
    genres: ['ACTION', 'CRIME', 'THRILL'],
    cast: ['Jr NTR', 'Saif Ali Khan', 'Janhvi Kapoor'],
    releaseDate: '2024-09-27',
    rating: 7.5,
    votes: '67K',
    certification: 'U/A',
    description: 'A coastal tale of courage, power and a man who becomes a legend.',
    posterUrl: '/assets/devara.jpg',
    backdropUrl: '/assets/devara.jpg',
    trailerUrl: '#'
  }
];

export const genres = ['All', 'Action', 'Horror', 'Comedy', 'Sci-Fi', 'Drama', 'Thriller', 'Crime'];

export const fallbackVenues = [
  {
    id: 1,
    name: 'PVR Cinemas — Phoenix Mall',
    city: 'Bengaluru',
    address: 'Whitefield, Bengaluru',
    distance: '3.2 km',
    shows: [
      { id: 101, startTime: '10:00 AM', language: 'Hindi', format: '2D', status: 'Available', price: 350 },
      { id: 102, startTime: '01:30 PM', language: 'Hindi', format: '4DX', status: 'Only 12 left', price: 420 },
      { id: 103, startTime: '05:00 PM', language: 'Hindi', format: 'IMAX', status: 'Houseful', price: 450 },
      { id: 104, startTime: '09:30 PM', language: 'English', format: '2D', status: 'Available', price: 350 }
    ]
  },
  {
    id: 2,
    name: 'INOX — City Center Mall',
    city: 'Bengaluru',
    address: 'MG Road, Bengaluru',
    distance: '5.8 km',
    shows: [
      { id: 201, startTime: '09:45 AM', language: 'Hindi', format: '2D', status: 'Available', price: 320 },
      { id: 202, startTime: '02:00 PM', language: 'Hindi', format: '3D', status: 'Available', price: 360 },
      { id: 203, startTime: '06:15 PM', language: 'English', format: '2D', status: 'Available', price: 320 },
      { id: 204, startTime: '10:00 PM', language: 'Hindi', format: 'IMAX', status: 'Only 8 left', price: 450 }
    ]
  },
  {
    id: 3,
    name: 'Cinepolis — Orion Mall',
    city: 'Bengaluru',
    address: 'Rajajinagar, Bengaluru',
    distance: '8.1 km',
    shows: [
      { id: 301, startTime: '11:00 AM', language: 'Hindi', format: '2D', status: 'Available', price: 300 },
      { id: 302, startTime: '04:30 PM', language: 'Hindi', format: '2D', status: 'Available', price: 300 }
    ]
  }
];

export const fallbackSeats = Array.from({ length: 80 }, (_, index) => {
  const rows = 'ABCDEFGH IJK'.replaceAll(' ', '');
  const row = rows[Math.floor(index / 8)];
  const number = (index % 8) + 1;
  const type = index < 24 ? 'GOLD_PLUS' : index < 56 ? 'EXECUTIVE' : 'SILVER';
  return { id: index + 1, seatNumber: `${row}${number}`, seatType: type, status: [7, 18, 29, 42, 67].includes(index) ? 'BOOKED' : 'AVAILABLE' };
});
