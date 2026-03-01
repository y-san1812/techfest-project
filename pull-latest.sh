#!/bin/bash
cd /vercel/share/v0-project
git fetch origin
git pull origin event-management-system
echo "Latest changes pulled successfully!"
