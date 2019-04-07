#!/bin/sh
HOST_IP=$(ip route show | awk '/default/ {print $3}') node dist/backend/backend/main

