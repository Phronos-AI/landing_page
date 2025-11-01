#!/usr/bin/env node

import Docker from 'dockerode';

const docker = new Docker();

const images = [
  'python:3.11-slim',
  'node:20-slim',
  'golang:1.21-alpine',
  'rust:1.75-slim',
  'openjdk:21-slim',
  'gcc:latest',
];

console.log('🐳 Pulling Docker images for Phronos backend...\n');

async function pullImage(imageName) {
  console.log(`Pulling ${imageName}...`);
  
  return new Promise((resolve, reject) => {
    docker.pull(imageName, (err, stream) => {
      if (err) return reject(err);
      
      docker.modem.followProgress(stream, (err, output) => {
        if (err) return reject(err);
        console.log(`✓ ${imageName} pulled successfully`);
        resolve(output);
      }, (event) => {
        // Show progress
        if (event.status === 'Downloading' && event.progress) {
          process.stdout.write(`\r  ${event.id}: ${event.progress}`);
        }
      });
    });
  });
}

async function pullAll() {
  for (const image of images) {
    try {
      await pullImage(image);
      console.log('');
    } catch (error) {
      console.error(`✗ Failed to pull ${image}:`, error.message);
    }
  }
  
  console.log('\n✅ All images pulled!');
}

pullAll().catch(console.error);

