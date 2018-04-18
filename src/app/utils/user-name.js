const firstNames = ['Oakley', 'Charlie', 'Azariah', 'Landry', 'Skyler', 'Justice', 'Armani', 'Frankie', 'Lennon', 'Dakota', 'Emerson', 'Casey', 'Finley', 'Lennox', 'Hayden', 'River', 'Briar', 'Tatum', 'Phoenix', 'Emory', 'Remy', 'Royal', 'Milan', 'Rowan', 'Sutton', 'Shiloh', 'Jessie', 'Amari', 'Rory', 'Sage', 'Jamie', 'Dallas', 'Leighton', 'Remington', 'Ellis', 'Riley', 'Peyton', 'Harley', 'Quinn', 'Alexis', 'Kamryn', 'Sawyer', 'Eden', 'Parker', 'Avery', 'Elliot', 'Elliott', 'Lyric', 'Rylan', 'Ariel', 'Jordan', 'Reese', 'Angel', 'Zion', 'Karter', 'Blake', 'Taylor', 'Marley', 'Payton', 'London', 'Morgan', 'Kendall', 'Emery', 'Kai', 'Micah', 'Jordyn', 'Cameron', 'Ryan', 'Dylan', 'Kayden', 'Reagan', 'Skylar', 'Logan', 'Carter', 'Hunter', 'Jayden', 'Harper'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell'];

export const generateName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  const result = `${firstName} ${lastName}`;
  if (result.length > 21) return generateName();
  return result;
};

export const getHandle = (name) =>
  name ? `@${name.toLowerCase().replace(/[^a-zA-Z\d]/g, '')}` : '';
