const getEffectiveAuctionStatus = (auction, now = new Date()) => {
  if (auction.status === 'CANCELLED') return 'CANCELLED';

  if (now < auction.start_time) return 'SCHEDULED';
  if (now < auction.end_time) return 'ACTIVE';

  return auction.highest_bid ? 'ENDED' : 'UNSOLD';
};

const getEffectiveStatusWhere = (status, now) => {
  if (status === 'CANCELLED') return { status: 'CANCELLED' };

  const notCancelled = { status: { not: 'CANCELLED' } };
  if (status === 'SCHEDULED') return { ...notCancelled, start_time: { gt: now } };
  if (status === 'ACTIVE') return { ...notCancelled, start_time: { lte: now }, end_time: { gt: now } };
  if (status === 'ENDED') return { ...notCancelled, end_time: { lte: now }, highest_bid: { isNot: null } };
  if (status === 'UNSOLD') return { ...notCancelled, end_time: { lte: now }, highest_bid: { is: null } };

  return {};
};

module.exports = { getEffectiveAuctionStatus, getEffectiveStatusWhere };