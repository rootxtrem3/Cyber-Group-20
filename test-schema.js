const mongoose = require('mongoose');
const Event = require('./models/event');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/test');
  
  const event = new Event({
    timestamp: new Date(),
    source_ip: '192.168.1.100',
    source_port: 54321,
    destination_port: 22,
    protocol: 'ssh',
    event_type: 'login_attempt',
    username: 'root',
    password: 'test123'
  });
  
  await event.save();
  console.log('✅ Schema test passed');
  await mongoose.connection.close();
}

test().catch(console.error);
