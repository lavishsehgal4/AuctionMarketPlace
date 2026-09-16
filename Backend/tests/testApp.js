const path = require('path');

function loadApp({ inactiveAuction = false } = {}) {
  jest.resetModules();
  jest.doMock('../logger', () => ({ logError: jest.fn() }));

  if (inactiveAuction) {
    const actualFs = jest.requireActual('fs');
    const auctionsPath = path.join(__dirname, '..', '..', 'Frontend', 'src', 'data', 'auctions.json');
    const auctions = JSON.parse(
      actualFs.readFileSync(auctionsPath, 'utf8').replace(/^\uFEFF/, '')
    );
    auctions[0].status = 'ended';

    jest.doMock('fs', () => ({
      ...actualFs,
      readFileSync(filePath, encoding) {
        if (filePath === auctionsPath) {
          return JSON.stringify(auctions);
        }
        return actualFs.readFileSync(filePath, encoding);
      },
    }));
  } else {
    jest.dontMock('fs');
  }

  return require('../server');
}

module.exports = { loadApp };
