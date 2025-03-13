import * as bcrypt from 'bcrypt';

async function testPasswordHash() {
  const password = 'MinaSayed142@';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Original password:', password);
  console.log('Hashed password:', hashedPassword);
  
  // Test if the password matches the hash
  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log('Password matches hash:', isMatch);
  
  // Test with a wrong password
  const wrongPassword = 'WrongPassword123!';
  const isWrongMatch = await bcrypt.compare(wrongPassword, hashedPassword);
  console.log('Wrong password matches hash:', isWrongMatch);
}

testPasswordHash(); 