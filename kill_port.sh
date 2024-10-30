#!/bin/bash

# Prompt for the port number
read -p "Enter the port number you want to kill: " port

# Find the process ID (PID) running on the specified port
pid=$(sudo lsof -t -i:$port)

# Check if a process was found
if [ -z "$pid" ]; then
  echo "No process is running on port $port."
else
  # Kill the process
  sudo kill -9 $pid
  echo "Process on port $port (PID: $pid) has been killed."
fi

