function logClients(clients) {
  console.log('Connected users:');
  console.log('---------------------------------------------------');
  Object.keys(clients).forEach(id => {
    const { name } = clients[id];
    console.log(`${id} - ${name}`);
  });
  console.log('---------------------------------------------------');
}

function logGameState(gameState) {
  console.log('Gamestate:', JSON.stringify(gameState, null, 2));
}

const os = require('os');
const ifaces = os.networkInterfaces();

function logIpAddresses() {
  Object.keys(ifaces).forEach(function(ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function(iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        console.log(ifname, iface.address);
      }
      ++alias;
    });
  });
}

exports.logClients = logClients;
exports.logGameState = logGameState;
exports.logIpAddresses = logIpAddresses;
