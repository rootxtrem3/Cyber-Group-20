#!/bin/bash
API_KEY=$(openssl rand -hex 32)
echo "API_KEY=${API_KEY}"
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=${JWT_SECRET}"
