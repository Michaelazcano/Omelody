import asyncio
import websockets
import json
import logging


logging.basicConfig(level=logging.INFO)


# Keep track of connected clients
connected_clients = set()


async def handler(websocket):
   """Handles incoming WebSocket connections."""
   # The 'path' argument is removed as it's not used and caused a TypeError
   connected_clients.add(websocket)
   logging.info(f"Client connected: {websocket.remote_address}")
   try:
       async for message in websocket:
           logging.info(f"Received message: {message}")
           # Broadcast the message to all connected clients
           websockets.broadcast(connected_clients, message)
   except websockets.exceptions.ConnectionClosedOK:
       logging.info(f"Client disconnected gracefully: {websocket.remote_address}")
   except websockets.exceptions.ConnectionClosedError as e:
       logging.warning(f"Client connection closed with error: {websocket.remote_address} - {e}")
   finally:
       connected_clients.remove(websocket)
       logging.info(f"Client removed: {websocket.remote_address}")


async def main():
   """Starts the WebSocket server."""
   port = 8765
   async with websockets.serve(handler, "localhost", port):
       logging.info(f"WebSocket server started on ws://localhost:{port}")
       await asyncio.Future()  # Run forever


if __name__ == "__main__":
   try:
       asyncio.run(main())
   except KeyboardInterrupt:
       logging.info("Server stopped.")

