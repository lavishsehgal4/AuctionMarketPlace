import { useEffect, useState } from 'react';
import socket from '../api/socket';

export default function useAuctionRoom(auctionId, currentUser) {
  const [roomStatus, setRoomStatus] = useState({ joined: false, message: 'Connecting to auction room...' });

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    let isMounted = true;
    const joinAuctionRoom = () => {
      socket.emit('joinAuction', auctionId, (response) => {
        if (!isMounted) return;
        setRoomStatus(response?.roomName
          ? { joined: true, message: 'You have successfully joined this auction room.' }
          : { joined: false, message: 'Unable to join this auction room.' });
      });
    };
    const handleDisconnect = () => setRoomStatus({ joined: false, message: 'Disconnected from this auction room.' });
    const handleConnectionError = () => setRoomStatus({ joined: false, message: 'Unable to connect to this auction room.' });

    socket.on('connect', joinAuctionRoom);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectionError);

    if (socket.connected) joinAuctionRoom();

    return () => {
      isMounted = false;
      socket.off('connect', joinAuctionRoom);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectionError);
      if (socket.connected) socket.emit('leaveAuction', auctionId);
    };
  }, [auctionId, currentUser]);

  return currentUser
    ? roomStatus
    : { joined: false, message: 'Log in to join this auction room.' };
}